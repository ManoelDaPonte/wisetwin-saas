import { NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";

// GET /api/training-management/member-completions - Récupérer les formations terminées par les membres de l'organisation
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const buildType = searchParams.get("buildType") || "WISETRAINER";

    // Récupérer tous les membres de l'organisation
    const organizationMembers = await prisma.organizationMember.findMany({
      where: {
        organizationId: request.organization.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Récupérer toutes les formations terminées par ces membres dans le container de l'organisation
    const memberIds = organizationMembers.map(member => member.userId);
    
    const memberCompletions = await prisma.userBuild.findMany({
      where: {
        userId: { in: memberIds },
        buildType: buildType.toUpperCase() as any,
        containerId: request.organization.azureContainerId,
        completed: true,
      },
      select: {
        id: true,
        userId: true,
        buildName: true,
        buildType: true,
        containerId: true,
        progress: true,
        completedAt: true,
        startedAt: true,
        lastAccessedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        completedAt: "desc",
      }
    });

    return NextResponse.json({
      memberCompletions,
      total: memberCompletions.length,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des completions des membres:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération" },
      { status: 500 }
    );
  }
});