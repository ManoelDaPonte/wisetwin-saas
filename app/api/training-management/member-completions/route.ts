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

    // Récupérer toutes les formations terminées par ces membres depuis TrainingAnalytics
    const memberIds = organizationMembers.map(member => member.userId);

    const completedAnalytics = await prisma.trainingAnalytics.findMany({
      where: {
        userId: { in: memberIds },
        buildType: buildType.toUpperCase() as "WISETOUR" | "WISETRAINER",
        containerId: request.organization.azureContainerId,
        completionStatus: 'COMPLETED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        endTime: "desc",
      }
    });

    // Grouper par utilisateur + formation pour éviter les doublons
    const uniqueCompletions = new Map<string, typeof completedAnalytics[0]>();
    completedAnalytics.forEach(analytics => {
      const key = `${analytics.userId}-${analytics.buildName}-${analytics.buildType}`;
      const existing = uniqueCompletions.get(key);

      // Garder la plus récente complétion
      if (!existing || new Date(analytics.endTime) > new Date(existing.endTime)) {
        uniqueCompletions.set(key, analytics);
      }
    });

    // Formater pour correspondre à l'ancien format UserBuild
    const memberCompletions = Array.from(uniqueCompletions.values()).map(analytics => ({
      id: analytics.id,
      userId: analytics.userId,
      buildName: analytics.buildName,
      buildType: analytics.buildType,
      containerId: analytics.containerId,
      progress: 100,
      completedAt: analytics.endTime,
      startedAt: analytics.startTime,
      lastAccessedAt: analytics.endTime,
      user: analytics.user,
    }));

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