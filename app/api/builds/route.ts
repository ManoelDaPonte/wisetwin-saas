import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { listBuilds, BuildType } from "@/lib/azure"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const containerId = searchParams.get("containerId")
    const buildType = searchParams.get("type") as BuildType
    
    if (!containerId || !buildType) {
      return NextResponse.json(
        { error: "Missing containerId or type parameter" },
        { status: 400 }
      )
    }
    
    if (buildType !== "wisetour" && buildType !== "wisetrainer") {
      return NextResponse.json(
        { error: "Invalid build type. Must be 'wisetour' or 'wisetrainer'" },
        { status: 400 }
      )
    }
    
    const builds = await listBuilds(containerId, buildType)
    
    return NextResponse.json({ builds })
    
  } catch (error) {
    console.error("Error fetching builds:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch builds" },
      { status: 500 }
    )
  }
}