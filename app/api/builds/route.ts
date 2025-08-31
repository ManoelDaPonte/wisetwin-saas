import { NextResponse } from "next/server";
import { listBuilds } from "@/lib/azure-server";
import { BuildType } from "@/types/azure";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const buildType = searchParams.get("type") as BuildType;
    const containerId = searchParams.get("containerId");
    const followedOnly = searchParams.get("followedOnly") === "true";

    if (!buildType) {
      return NextResponse.json(
        { error: "Missing type parameter" },
        { status: 400 }
      );
    }

    if (buildType !== "wisetour" && buildType !== "wisetrainer") {
      return NextResponse.json(
        { error: "Invalid build type. Must be 'wisetour' or 'wisetrainer'" },
        { status: 400 }
      );
    }

    if (!containerId) {
      return NextResponse.json(
        { error: "Missing containerId parameter" },
        { status: 400 }
      );
    }

    // Vérifier si c'est un container personnel
    if (containerId.startsWith("personal-")) {
      // Vérifier que l'utilisateur a accès à ce container personnel
      if (containerId !== req.user.azureContainerId) {
        return NextResponse.json(
          { error: "You don't have access to this personal container" },
          { status: 403 }
        );
      }
    } else {
      // C'est un container d'organisation, vérifier l'accès
      const org = await prisma.organization.findFirst({
        where: { azureContainerId: containerId },
      });

      if (!org) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        );
      }

      // Vérifier si l'utilisateur a accès à cette organisation
      const hasAccess = await prisma.organizationMember.findFirst({
        where: {
          organizationId: org.id,
          userId: req.user.id,
        },
      });

      if (!hasAccess && org.ownerId !== req.user.id) {
        return NextResponse.json(
          { error: "You don't have access to this organization" },
          { status: 403 }
        );
      }
    }

    // Récupérer les builds depuis Azure uniquement
    let builds = await listBuilds(containerId, buildType);

    // Si on veut seulement les formations suivies, filtrer
    if (followedOnly) {
      const followedBuilds = await prisma.userBuild.findMany({
        where: {
          userId: req.user.id,
          buildType: buildType.toUpperCase() as "WISETOUR" | "WISETRAINER", // Convert to Prisma enum
          containerId: containerId,
        },
        select: {
          buildName: true,
        },
      });

      const followedBuildNames = new Set(
        followedBuilds.map((fb) => fb.buildName)
      );

      builds = builds.filter(build => 
        followedBuildNames.has(build.name) || followedBuildNames.has(build.id || "")
      );
    }

    // Trier par date de modification (plus récent en premier)
    builds.sort((a, b) => {
      const dateA = new Date(a.lastModified || 0).getTime();
      const dateB = new Date(b.lastModified || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ builds });
  } catch (error) {
    console.error("Error fetching builds:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch builds",
      },
      { status: 500 }
    );
  }
});