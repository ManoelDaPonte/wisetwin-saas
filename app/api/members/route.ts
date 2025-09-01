import { NextResponse } from "next/server"
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper"
import { prisma } from "@/lib/prisma"
import { sendInvitationEmail } from "@/lib/email-service"

// GET /api/members?organizationId=xxx - Récupérer tous les membres et invitations
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Récupérer le propriétaire via l'organisation
    const organization = await prisma.organization.findUnique({
      where: { id: request.organization.id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })
    
    const owner = organization?.owner

    // Récupérer les membres
    const memberships = await prisma.organizationMember.findMany({
      where: { organizationId: request.organization.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: "asc" }
    })

    // Formater les données - éviter les doublons si le propriétaire est aussi dans OrganizationMember
    const membersMap = new Map()
    
    // D'abord ajouter tous les membres
    memberships.forEach(m => {
      membersMap.set(m.user.id, {
        id: m.user.id,
        firstName: m.user.firstName,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.image,
        role: m.role,
        joinedAt: m.createdAt.toISOString(),
        isOwner: false,
      })
    })
    
    // Puis ajouter/remplacer le propriétaire avec le bon rôle
    if (owner) {
      membersMap.set(owner.id, {
        id: owner.id,
        firstName: owner.firstName,
        name: owner.name,
        email: owner.email,
        avatarUrl: owner.image,
        role: "OWNER" as const,
        joinedAt: organization.createdAt.toISOString(),
        isOwner: true,
      })
    }
    
    // Convertir en array et trier (propriétaire en premier)
    const members = Array.from(membersMap.values()).sort((a, b) => {
      if (a.isOwner) return -1
      if (b.isOwner) return 1
      return 0
    })

    // Récupérer les invitations en attente
    const invitations = await prisma.organizationInvitation.findMany({
      where: {
        organizationId: request.organization.id,
        status: "PENDING",
        expiresAt: {
          gt: new Date() // Non expirées
        }
      },
      include: {
        invitedBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Formater les invitations
    const formattedInvitations = invitations.map(inv => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      invitedBy: inv.invitedBy.name || inv.invitedBy.email,
      createdAt: inv.createdAt.toISOString(),
      expiresAt: inv.expiresAt.toISOString(),
      status: inv.status
    }))

    return NextResponse.json({
      members,
      invitations: formattedInvitations,
    })
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des membres" },
      { status: 500 }
    )
  }
})

// Fonction pour générer un code court unique (8 caractères pour plus de sécurité)
function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// POST /api/members?organizationId=xxx - Inviter un nouveau membre
export const POST = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Vérifier les permissions (seuls OWNER et ADMIN peuvent inviter)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission d'inviter des membres" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, role } = body

    // Validation
    if (!email || !role || !["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Email et rôle (ADMIN ou MEMBER) requis" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà et est membre
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Vérifier si déjà membre
      const existingMember = await prisma.organizationMember.findFirst({
        where: {
          userId: existingUser.id,
          organizationId: request.organization.id
        }
      })

      if (existingMember) {
        return NextResponse.json(
          { error: "Cet utilisateur est déjà membre de l'organisation" },
          { status: 409 }
        )
      }

      // Vérifier si c'est le propriétaire
      const org = await prisma.organization.findUnique({
        where: { id: request.organization.id }
      })

      if (org?.ownerId === existingUser.id) {
        return NextResponse.json(
          { error: "Le propriétaire est déjà membre de l'organisation" },
          { status: 409 }
        )
      }
    }

    // Vérifier la limite d'utilisateurs
    const orgDetails = await prisma.organization.findUnique({
      where: { id: request.organization.id },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    const currentMemberCount = (orgDetails?._count.members || 0) + 1; // +1 pour le propriétaire
    const maxUsers = orgDetails?.maxUsers || 1;

    if (currentMemberCount + 1 > maxUsers) { // +1 pour le nouveau membre à inviter
      return NextResponse.json(
        { error: `Limite d'utilisateurs atteinte (${maxUsers} maximum). Contactez l'administrateur pour augmenter cette limite.` },
        { status: 403 }
      );
    }

    // Vérifier s'il y a déjà une invitation
    const existingInvitation = await prisma.organizationInvitation.findUnique({
      where: {
        email_organizationId: {
          email,
          organizationId: request.organization.id
        }
      }
    })

    if (existingInvitation) {
      if (existingInvitation.status === "PENDING" && existingInvitation.expiresAt > new Date()) {
        return NextResponse.json(
          { error: "Une invitation est déjà en attente pour cet email" },
          { status: 409 }
        )
      }
      
      // Si l'invitation est expirée, annulée ou acceptée, on peut la supprimer et en créer une nouvelle
      await prisma.organizationInvitation.delete({
        where: { id: existingInvitation.id }
      })
    }

    // Générer un code court unique
    let code: string
    let codeExists = true
    while (codeExists) {
      code = generateShortCode()
      const existing = await prisma.organizationInvitation.findUnique({
        where: { code }
      })
      codeExists = !!existing
    }

    // Créer l'invitation
    const invitation = await prisma.organizationInvitation.create({
      data: {
        email,
        role,
        code: code!,
        organizationId: request.organization.id,
        invitedById: request.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
      include: {
        organization: {
          select: {
            name: true
          }
        },
        invitedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Envoyer l'email d'invitation
    try {
      await sendInvitationEmail({
        email: invitation.email,
        organizationName: invitation.organization.name,
        inviterName: invitation.invitedBy.name || invitation.invitedBy.email,
        token: invitation.token,
        code: invitation.code,
        role: invitation.role,
        expiresAt: invitation.expiresAt
      })
    } catch {
      // On ne bloque pas la création de l'invitation si l'email échoue
    }

    return NextResponse.json({
      message: "Invitation envoyée avec succès",
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        status: invitation.status
      }
    })
  } catch (error) {
    console.error("Error inviting member:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'invitation" },
      { status: 500 }
    )
  }
})