import { NextResponse } from "next/server"
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper"
import { prisma } from "@/lib/prisma"

// PATCH /api/members/[memberId] - Mettre à jour le rôle
export const PATCH = withOrgAuth(async (
  request: OrgAuthenticatedRequest,
  context?: unknown
) => {
  try {
    // Récupérer les params (Next.js 15 requiert await)
    const { memberId } = await (context as { params: Promise<{ memberId: string }> }).params;
    
    // Vérifier les permissions
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de modifier les rôles" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { role } = body

    if (!role || !["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Rôle invalide (ADMIN ou MEMBER)" },
        { status: 400 }
      )
    }

    // Vérifier que le membre existe
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: memberId,
        organizationId: request.organization.id
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: "Membre non trouvé" },
        { status: 404 }
      )
    }

    // Mettre à jour le rôle
    const updated = await prisma.organizationMember.update({
      where: { id: membership.id },
      data: { role }
    })

    return NextResponse.json({
      message: "Rôle mis à jour avec succès",
      membership: updated
    })
  } catch (error) {
    console.error("Error updating member role:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du rôle" },
      { status: 500 }
    )
  }
})

// DELETE /api/members/[memberId] - Retirer un membre
export const DELETE = withOrgAuth(async (
  request: OrgAuthenticatedRequest,
  context?: unknown
) => {
  try {
    // Récupérer les params (Next.js 15 requiert await)
    const { memberId } = await (context as { params: Promise<{ memberId: string }> }).params;
    
    // Vérifier les permissions
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de retirer des membres" },
        { status: 403 }
      )
    }

    // Vérifier qu'on n'essaie pas de retirer le propriétaire
    const org = await prisma.organization.findUnique({
      where: { id: request.organization.id }
    })

    if (org?.ownerId === memberId) {
      return NextResponse.json(
        { error: "Impossible de retirer le propriétaire de l'organisation" },
        { status: 400 }
      )
    }

    // Vérifier que le membre existe
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: memberId,
        organizationId: request.organization.id
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: "Membre non trouvé" },
        { status: 404 }
      )
    }
    // Un membre peut se retirer lui-même
    if (memberId === request.user.id && request.organization.role !== "OWNER" && request.organization.role !== "ADMIN") {
      // C'est OK, un membre peut quitter l'organisation
    }

    // Supprimer le membership
    await prisma.organizationMember.delete({
      where: { id: membership.id }
    })

    return NextResponse.json({
      message: "Membre retiré avec succès"
    })
  } catch (error) {
    console.error("Error removing member:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du membre" },
      { status: 500 }
    )
  }
})