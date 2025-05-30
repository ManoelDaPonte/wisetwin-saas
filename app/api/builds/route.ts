import { NextResponse } from "next/server"
import { listBuilds, BuildType } from "@/lib/azure"
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper"

export const GET = withOrgAuth(async (req: OrgAuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const buildType = searchParams.get("type") as BuildType
    
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
    
    // Use the container ID from the authenticated organization
    const builds = await listBuilds(req.organization.azureContainerId, buildType)
    
    return NextResponse.json({ builds })
    
  } catch (error) {
    console.error("Error fetching builds:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch builds" },
      { status: 500 }
    )
  }
})