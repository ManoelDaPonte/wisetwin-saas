import { NextResponse } from "next/server"
import { listBuilds, BuildType } from "@/lib/azure"
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper"
import { prisma } from "@/lib/prisma"

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const buildType = searchParams.get("type") as BuildType
    const containerId = searchParams.get("containerId")
    
    if (!buildType) {
      return NextResponse.json(
        { error: "Missing type parameter" },
        { status: 400 }
      )
    }
    
    if (buildType !== "wisetour" && buildType !== "wisetrainer") {
      return NextResponse.json(
        { error: "Invalid build type. Must be 'wisetour' or 'wisetrainer'" },
        { status: 400 }
      )
    }

    if (!containerId) {
      return NextResponse.json(
        { error: "Missing containerId parameter" },
        { status: 400 }
      )
    }

    // Vérifier si c'est un container personnel
    if (containerId.startsWith('personal-')) {
      // Vérifier que l'utilisateur a accès à ce container personnel
      if (containerId !== req.user.azureContainerId) {
        return NextResponse.json(
          { error: "You don't have access to this personal container" },
          { status: 403 }
        )
      }
    } else {
      // C'est un container d'organisation, vérifier l'accès
      const org = await prisma.organization.findFirst({
        where: { azureContainerId: containerId }
      })

      if (!org) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        )
      }

      // Vérifier si l'utilisateur a accès à cette organisation
      const hasAccess = await prisma.organizationMember.findFirst({
        where: {
          organizationId: org.id,
          userId: req.user.id
        }
      })

      if (!hasAccess && org.ownerId !== req.user.id) {
        return NextResponse.json(
          { error: "You don't have access to this organization" },
          { status: 403 }
        )
      }
    }
    
    // Lister les builds
    const builds = await listBuilds(containerId, buildType)
    
    return NextResponse.json({ builds })
    
  } catch (error) {
    console.error("Error fetching builds:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch builds" },
      { status: 500 }
    )
  }
})