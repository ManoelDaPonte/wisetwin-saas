import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createOrganizationContainer } from "@/lib/azure"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    // Combine owned organizations and member organizations
    const organizations = [
      // Organizations where user is owner
      ...user.organizations.map((org) => ({
        id: org.id,
        name: org.name,
        description: org.description,
        role: "OWNER" as const,
        azureContainerId: org.azureContainerId,
      })),
      // Organizations where user is member
      ...user.OrganizationMember.map((member) => ({
        id: member.organization.id,
        name: member.organization.name,
        description: member.organization.description,
        role: member.role,
        azureContainerId: member.organization.azureContainerId,
      })),
    ]

    return NextResponse.json(organizations)
  } catch (error) {
    console.error("[ORGANIZATIONS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, description } = body

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Create organization with owner
    const organization = await prisma.organization.create({
      data: {
        name,
        description,
        azureContainerId: "", // Will be updated after container creation
        ownerId: user.id,
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
} 