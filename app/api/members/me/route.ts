import { NextResponse } from "next/server"
import { withOrgAuth, type OrgAuthenticatedRequest } from "@/lib/auth-wrapper"
import { prisma } from "@/lib/prisma"

// DELETE /api/members/me?organizationId=xxx - Quitter l'organisation
export const DELETE = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Un propriétaire ne peut pas quitter son organisation
    if (request.organization.role === "OWNER") {
      return NextResponse.json(
        { message: "Le propriétaire ne peut pas quitter l'organisation. Transférez d'abord la propriété." },
        { status: 400 }
      )
    }

    // Trouver et supprimer le membership
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: request.organization.id,
        userId: request.user.id
      }
    })

    if (membership) {
      await prisma.organizationMember.delete({
        where: { id: membership.id }
      })
    }

    return NextResponse.json({ message: "Vous avez quitté l'organisation avec succès" })
  } catch (error) {
    console.error("Erreur lors de la sortie de l'organisation:", error)
    return NextResponse.json(
      { message: "Erreur lors de la sortie de l'organisation" },
      { status: 500 }
    )
  }
})