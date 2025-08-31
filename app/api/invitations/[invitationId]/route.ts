import { NextResponse } from "next/server"
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper"
import { prisma } from "@/lib/prisma"

// DELETE /api/invitations/[invitationId] - Annuler une invitation
export const DELETE = withOrgAuth(async (
  request: OrgAuthenticatedRequest,
  context?: unknown
) => {
  try {
    const { invitationId } = await (context as { params: Promise<{ invitationId: string }> }).params
    
    // Vérifier les permissions
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission d'annuler des invitations" },
        { status: 403 }
      )
    }

    // Vérifier que l'invitation existe et appartient à l'organisation
    const invitation = await prisma.organizationInvitation.findFirst({
      where: {
        id: invitationId,
        organizationId: request.organization.id,
        status: "PENDING"
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée" },
        { status: 404 }
      )
    }

    // Mettre à jour le statut de l'invitation
    await prisma.organizationInvitation.update({
      where: { id: invitationId },
      data: { status: "CANCELLED" }
    })

    return NextResponse.json({
      message: "Invitation annulée avec succès"
    })
  } catch (error) {
    console.error("Error cancelling invitation:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'annulation de l'invitation" },
      { status: 500 }
    )
  }
})