import { NextRequest, NextResponse } from "next/server"
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper"
import { prisma } from "@/lib/prisma"

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
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: "asc" }
    })

    // Formater les données
    const members = [
      // Ajouter le propriétaire en premier
      owner && {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        avatarUrl: owner.image,
        role: "OWNER" as const,
        joinedAt: organization.createdAt.toISOString(),
        isOwner: true,
      },
      // Ajouter les autres membres
      ...memberships.map(m => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.image,
        role: m.role,
        joinedAt: m.createdAt.toISOString(),
        isOwner: false,
      }))
    ].filter(Boolean)

    // TODO: Récupérer les invitations quand le modèle sera créé
    const invitations: any[] = []

    return NextResponse.json({
      members,
      invitations,
    })
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des membres" },
      { status: 500 }
    )
  }
})

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

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "Cet utilisateur n'existe pas. Il doit d'abord créer un compte." },
        { status: 404 }
      )
    }

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

    // Créer le membership directement (pas d'invitation pour l'instant)
    const membership = await prisma.organizationMember.create({
      data: {
        userId: existingUser.id,
        organizationId: request.organization.id,
        role,
      }
    })

    return NextResponse.json({
      message: "Membre ajouté avec succès",
      membership
    })
  } catch (error) {
    console.error("Error inviting member:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'invitation" },
      { status: 500 }
    )
  }
})