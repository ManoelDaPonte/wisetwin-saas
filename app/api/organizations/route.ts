import { NextResponse } from "next/server"
import { createOrganizationContainer } from "@/lib/azure"
import { prisma } from "@/lib/prisma"
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper"

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        organizations: true,
        OrganizationMember: {
          include: {
            organization: true,
          },
        },
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Combine owned organizations and member organizations - éviter les doublons
    const organizationsMap = new Map()
    
    // D'abord ajouter les organisations où l'utilisateur est membre
    user.OrganizationMember.forEach((member) => {
      organizationsMap.set(member.organization.id, {
        id: member.organization.id,
        name: member.organization.name,
        description: member.organization.description,
        role: member.role,
        azureContainerId: member.organization.azureContainerId,
      })
    })
    
    // Puis ajouter/remplacer les organisations où l'utilisateur est propriétaire
    user.organizations.forEach((org) => {
      organizationsMap.set(org.id, {
        id: org.id,
        name: org.name,
        description: org.description,
        role: "OWNER" as const,
        azureContainerId: org.azureContainerId,
      })
    })
    
    // Convertir en array
    const organizations = Array.from(organizationsMap.values())

    return NextResponse.json(organizations)
  } catch (error) {
    console.error("[ORGANIZATIONS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
})

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { name, description } = body

    if (!name || typeof name !== 'string') {
      return new NextResponse("Name is required", { status: 400 })
    }

    // Sanitize inputs
    const sanitizedName = name.trim().slice(0, 100)
    const sanitizedDescription = description ? String(description).trim().slice(0, 500) : null

    // Create organization with owner
    const organization = await prisma.organization.create({
      data: {
        name: sanitizedName,
        description: sanitizedDescription,
        azureContainerId: "", // Will be updated after container creation
        ownerId: req.user.id,
      },
    })

    // Create Azure container
    const containerId = await createOrganizationContainer(organization.name, organization.id)

    // Update organization with container ID
    const updatedOrganization = await prisma.organization.update({
      where: { id: organization.id },
      data: { azureContainerId: containerId },
    })

    return NextResponse.json({
      id: updatedOrganization.id,
      name: updatedOrganization.name,
      description: updatedOrganization.description,
      role: "OWNER",
      azureContainerId: updatedOrganization.azureContainerId,
    })
  } catch (error) {
    console.error("[ORGANIZATIONS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}) 