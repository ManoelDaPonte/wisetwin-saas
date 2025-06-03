import { NextResponse } from "next/server"
import { withOrgAuth, type OrgAuthenticatedRequest } from "@/lib/auth-wrapper"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { deleteContainer } from "@/lib/azure"

const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
})

// PATCH - Mettre à jour l'organisation
export const PATCH = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Vérifier que l'utilisateur est propriétaire ou admin
    if (request.organization.role !== "OWNER" && request.organization.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Vous n'avez pas les permissions nécessaires" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateOrganizationSchema.parse(body)

    // Vérifier l'unicité du nom si modifié
    if (validatedData.name !== request.organization.name) {
      const existingOrg = await prisma.organization.findFirst({
        where: {
          name: validatedData.name,
          id: { not: request.organization.id }
        }
      })

      if (existingOrg) {
        return NextResponse.json(
          { message: "Une organisation avec ce nom existe déjà" },
          { status: 400 }
        )
      }
    }

    // Mettre à jour l'organisation
    const updatedOrganization = await prisma.organization.update({
      where: { id: request.organization.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        updatedAt: new Date(),
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedOrganization)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("Erreur lors de la mise à jour de l'organisation:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
})

// DELETE - Supprimer l'organisation
export const DELETE = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Seul le propriétaire peut supprimer l'organisation
    if (request.organization.role !== "OWNER") {
      return NextResponse.json(
        { message: "Seul le propriétaire peut supprimer l'organisation" },
        { status: 403 }
      )
    }

    // Transaction pour supprimer l'organisation et toutes ses données
    await prisma.$transaction(async (tx) => {
      // Supprimer toutes les invitations
      await tx.organizationInvitation.deleteMany({
        where: { organizationId: request.organization.id }
      })

      // Supprimer tous les membres
      await tx.organizationMember.deleteMany({
        where: { organizationId: request.organization.id }
      })

      // Supprimer l'organisation
      await tx.organization.delete({
        where: { id: request.organization.id }
      })
    })

    // Supprimer le container Azure associé
    try {
      await deleteContainer(request.organization.azureContainerId)
    } catch (error) {
      console.error("Erreur lors de la suppression du container Azure:", error)
      // On continue même si la suppression du container échoue
    }

    return NextResponse.json({ message: "Organisation supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'organisation:", error)
    return NextResponse.json(
      { message: "Erreur lors de la suppression de l'organisation" },
      { status: 500 }
    )
  }
})