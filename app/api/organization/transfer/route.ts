import { NextResponse } from "next/server"
import { withOrgAuth, type OrgAuthenticatedRequest } from "@/lib/auth-wrapper"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const transferOwnershipSchema = z.object({
  newOwnerId: z.string().min(1),
})

// POST - Transférer la propriété de l'organisation
export const POST = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Seul le propriétaire peut transférer la propriété
    if (request.organization.role !== "OWNER") {
      return NextResponse.json(
        { message: "Seul le propriétaire peut transférer la propriété" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { newOwnerId } = transferOwnershipSchema.parse(body)

    // Vérifier que le nouveau propriétaire est un admin de l'organisation
    const newOwnerMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: request.organization.id,
        userId: newOwnerId,
        role: "ADMIN"
      }
    })

    if (!newOwnerMember) {
      return NextResponse.json(
        { message: "Le nouvel propriétaire doit être un administrateur de l'organisation" },
        { status: 400 }
      )
    }

    // Transaction pour transférer la propriété
    const updatedOrganization = await prisma.$transaction(async (tx) => {
      // Mettre à jour l'organisation avec le nouveau propriétaire
      const org = await tx.organization.update({
        where: { id: request.organization.id },
        data: {
          ownerId: newOwnerId,
          updatedAt: new Date(),
        }
      })

      // Le nouveau propriétaire reste ADMIN dans la table OrganizationMember
      // La propriété est gérée uniquement par le champ ownerId dans Organization
      
      // L'ancien propriétaire devient ADMIN s'il n'est pas déjà membre
      const currentOwnerMember = await tx.organizationMember.findFirst({
        where: {
          organizationId: request.organization.id,
          userId: request.user.id
        }
      })

      if (!currentOwnerMember) {
        // Si l'ancien propriétaire n'a pas d'entrée dans OrganizationMember, en créer une
        await tx.organizationMember.create({
          data: {
            userId: request.user.id,
            organizationId: request.organization.id,
            role: "ADMIN"
          }
        })
      }

      // Retourner l'organisation mise à jour avec les membres
      return await tx.organization.findUnique({
        where: { id: org.id },
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
    })

    return NextResponse.json(updatedOrganization)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("Erreur lors du transfert de propriété:", error)
    return NextResponse.json(
      { message: "Erreur lors du transfert de propriété" },
      { status: 500 }
    )
  }
})