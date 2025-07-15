import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { BuildType } from "@/lib/azure";
import { BuildType as PrismaBuildType } from "@prisma/client";

interface FollowBuildRequest {
  buildName: string;
  buildType: BuildType;
  containerId: string;
}

// Helper function to convert BuildType to Prisma enum
function toPrismaBuildType(buildType: BuildType): PrismaBuildType {
  return buildType.toUpperCase() as PrismaBuildType;
}

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body: FollowBuildRequest = await req.json();
    const { buildName, buildType, containerId } = body;

    if (!buildName || !buildType || !containerId) {
      return NextResponse.json(
        { error: "buildName, buildType, and containerId are required" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a accès à ce container
    if (containerId.startsWith("personal-")) {
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

    // Créer ou mettre à jour le suivi de la formation
    const userBuild = await prisma.userBuild.upsert({
      where: {
        userId_buildName_buildType_containerId: {
          userId: req.user.id,
          buildName,
          buildType: toPrismaBuildType(buildType),
          containerId,
        },
      },
      create: {
        userId: req.user.id,
        buildName,
        buildType: toPrismaBuildType(buildType),
        containerId,
        lastAccessedAt: new Date(),
      },
      update: {
        lastAccessedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      userBuild: {
        id: userBuild.id,
        buildName: userBuild.buildName,
        buildType: userBuild.buildType,
        progress: userBuild.progress,
        completed: userBuild.completed,
        startedAt: userBuild.startedAt,
        lastAccessedAt: userBuild.lastAccessedAt,
      },
    });
  } catch (error) {
    console.error("Error following build:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to follow build",
      },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const buildName = searchParams.get("buildName");
    const buildType = searchParams.get("buildType") as BuildType;
    const containerId = searchParams.get("containerId");

    if (!buildName || !buildType || !containerId) {
      return NextResponse.json(
        { error: "buildName, buildType, and containerId are required" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a accès à ce container (même logique que POST)
    if (containerId.startsWith("personal-")) {
      if (containerId !== req.user.azureContainerId) {
        return NextResponse.json(
          { error: "You don't have access to this personal container" },
          { status: 403 }
        );
      }
    } else {
      const org = await prisma.organization.findFirst({
        where: { azureContainerId: containerId },
      });

      if (!org) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        );
      }

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

    // Supprimer le suivi de la formation
    await prisma.userBuild.deleteMany({
      where: {
        userId: req.user.id,
        buildName,
        buildType: toPrismaBuildType(buildType),
        containerId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unfollowing build:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to unfollow build",
      },
      { status: 500 }
    );
  }
});
