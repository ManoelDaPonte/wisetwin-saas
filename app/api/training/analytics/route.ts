import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { GetTrainingAnalyticsQuerySchema } from "@/validators/analytics";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Prisma } from "@prisma/client";
import type { InteractionData, QuestionInteractionData } from "@/types/training";

/**
 * GET /api/training/analytics - Récupérer les analytics de formation
 *
 * Version temporaire pour debug - accès sans organisation stricte
 */
export async function GET(req: NextRequest) {
  try {
    // Récupérer la session pour obtenir l'organisation
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Non authentifié",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Récupérer l'organisation depuis la query ou utiliser celle par défaut
    let organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      // Essayer de récupérer l'organisation active de l'utilisateur
      const userWithOrgs = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          OrganizationMember: {
            include: {
              organization: true,
            },
          },
          organizations: true,
        },
      });

      // Utiliser la première organisation trouvée
      if (userWithOrgs?.organizations?.[0]) {
        organizationId = userWithOrgs.organizations[0].id;
      } else if (userWithOrgs?.OrganizationMember?.[0]) {
        organizationId = userWithOrgs.OrganizationMember[0].organizationId;
      }
    }

    // Pour debug
    console.log("Analytics API - User:", session.user.email);
    console.log("Analytics API - OrganizationId:", organizationId);

    // Validation des paramètres de requête
    const validationResult =
      GetTrainingAnalyticsQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.flatten());
      return NextResponse.json(
        {
          error: "Paramètres invalides",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      userId,
      buildName,
      buildType,
      buildVersion,
      tagId,
      startDate,
      endDate,
      completionStatus,
      page = 1,
      limit = 20,
    } = validationResult.data;

    // Construction des conditions de requête
    const whereConditions: Prisma.TrainingAnalyticsWhereInput = {};

    // Si on a une organisation, filtrer par elle
    if (organizationId) {
      whereConditions.organizationId = organizationId;
    }

    if (userId) {
      whereConditions.userId = userId;
    }

    if (buildName) {
      whereConditions.buildName = buildName;
    }

    if (buildType) {
      whereConditions.buildType = buildType.toUpperCase() as "WISETOUR" | "WISETRAINER";
    }

    if (buildVersion) {
      whereConditions.buildVersion = buildVersion;
    }

    if (completionStatus) {
      whereConditions.completionStatus = completionStatus;
    }

    if (startDate || endDate) {
      whereConditions.startTime = {};
      if (startDate) {
        whereConditions.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        whereConditions.startTime.lte = new Date(endDate);
      }
    }

    // Si un tagId est fourni, filtrer par les formations associées à ce tag
    if (tagId) {
      const buildTags = await prisma.buildTag.findMany({
        where: { tagId },
        select: { buildName: true, buildType: true },
      });

      if (buildTags.length > 0) {
        whereConditions.OR = buildTags.map((bt) => ({
          buildName: bt.buildName,
          buildType: bt.buildType,
        }));
      }
    }

    // Compter le total pour la pagination
    const totalCount = await prisma.trainingAnalytics.count({
      where: whereConditions,
    });

    // Récupérer les analytics avec pagination
    const analytics = await prisma.trainingAnalytics.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculer les métriques agrégées
    const aggregates = await prisma.trainingAnalytics.aggregate({
      where: whereConditions,
      _avg: {
        totalDuration: true,
        successRate: true,
        averageTimePerInteraction: true,
      },
      _count: {
        id: true,
      },
      _sum: {
        totalInteractions: true,
        successfulInteractions: true,
        failedInteractions: true,
      },
    });

    // Compter par statut de complétion
    const statusCounts = await prisma.trainingAnalytics.groupBy({
      by: ["completionStatus"],
      where: whereConditions,
      _count: {
        id: true,
      },
    });

    // Identifier les questions les plus échouées
    const allAnalytics = await prisma.trainingAnalytics.findMany({
      where: whereConditions,
      select: {
        interactions: true,
      },
    });

    const questionFailures = new Map<
      string,
      { text: string; failures: number; attempts: number }
    >();

    allAnalytics.forEach((session) => {
      const interactions = session.interactions as unknown as InteractionData[];
      interactions?.forEach((interaction) => {
        if (interaction.type === "question" && interaction.data) {
          const questionData = interaction.data as QuestionInteractionData;
          const key = questionData.questionText;
          const current = questionFailures.get(key) || {
            text: key,
            failures: 0,
            attempts: 0,
          };
          current.attempts += interaction.attempts || 1;
          if (!questionData.firstAttemptCorrect) {
            current.failures++;
          }
          questionFailures.set(key, current);
        }
      });
    });

    const mostFailedQuestions = Array.from(questionFailures.values())
      .sort((a, b) => b.failures / b.attempts - a.failures / a.attempts)
      .slice(0, 5)
      .map((q) => ({
        questionText: q.text,
        failureRate: (q.failures / q.attempts) * 100,
        attemptCount: q.attempts,
      }));

    // Formater la réponse
    const response = {
      analytics: analytics.map((a) => ({
        id: a.id,
        sessionId: a.sessionId,
        trainingId: a.trainingId,
        buildName: a.buildName,
        buildType: a.buildType,
        buildVersion: a.buildVersion || "1.0.0", // Défaut pour rétrocompatibilité
        user: a.user,
        startTime: a.startTime,
        endTime: a.endTime,
        totalDuration: a.totalDuration,
        completionStatus: a.completionStatus,
        successRate: a.successRate,
        totalInteractions: a.totalInteractions,
        successfulInteractions: a.successfulInteractions,
        failedInteractions: a.failedInteractions,
        interactions: a.interactions,
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      aggregates: {
        totalSessions: aggregates._count.id || 0,
        averageDuration: aggregates._avg.totalDuration || 0,
        averageSuccessRate: aggregates._avg.successRate || 0,
        averageTimePerInteraction:
          aggregates._avg.averageTimePerInteraction || 0,
        totalInteractions: aggregates._sum.totalInteractions || 0,
        totalSuccessful: aggregates._sum.successfulInteractions || 0,
        totalFailed: aggregates._sum.failedInteractions || 0,
        statusBreakdown: statusCounts.reduce((acc, curr) => {
          acc[curr.completionStatus] = curr._count.id;
          return acc;
        }, {} as Record<string, number>),
        mostFailedQuestions,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération des analytics:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Paramètres invalides",
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 }
    );
  }
}
