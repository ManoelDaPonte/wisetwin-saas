import { NextResponse } from "next/server";
import { listBuilds, BuildType, Build } from "@/lib/azure";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const buildType = searchParams.get("type") as BuildType;
    const containerId = searchParams.get("containerId");

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

    // Lister les builds
    const builds: Build[] = await listBuilds(containerId, buildType);

    // Enrichir les builds avec les données locales
    const enrichedBuilds = [];
    for (const build of builds) {
      const newBuild = { ...build }; // Create a mutable copy
      const filePath = path.join(
        process.cwd(),
        "data",
        buildType,
        `${newBuild.name}.json`
      );
      try {
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, "utf-8");
          const localData = JSON.parse(fileContent);
          // Merge localData into the build object
          // Local data will overwrite Azure data in case of conflicts
          Object.assign(newBuild, localData);
        } else {
          console.warn(
            `Local data file not found for build ${newBuild.name} of type ${buildType} at ${filePath}`
          );
        }
      } catch (e) {
        console.error(
          `Error reading or parsing local data for build ${newBuild.name} at ${filePath}:`,
          e
        );
        // Optionally, you could add a specific error field to the build object here
        // e.g., build.enrichmentError = 'Failed to load local data';
      }
      enrichedBuilds.push(newBuild);
    }

    return NextResponse.json({ builds: enrichedBuilds });
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
