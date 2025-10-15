import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GetTrainingAnalyticsQuerySchema } from "@/validators/analytics";
import { z } from "zod";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { Prisma } from "@prisma/client";
import type { InteractionData, QuestionInteractionData } from "@/types/training";
import { enrichAnalyticsWithMetadata } from "@/lib/analytics/metadata-resolver";
import { getMetadataForBuild } from "@/lib/admin/metadata-service";

/**
 * GET /api/training/analytics - Récupérer les analytics de formation
 *
 * 🔒 SÉCURISÉ avec withOrgAuth() - Garantit l'accès uniquement aux données de l'organisation
 */
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // ✅ SÉCURISÉ : Utilise automatiquement l'organisation de l'utilisateur authentifié
    const organizationId = request.organization.id;

    // Validation des paramètres de requête
    const validationResult =
      GetTrainingAnalyticsQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
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
    const whereConditions: Prisma.TrainingAnalyticsWhereInput = {
      // ✅ SÉCURISÉ : Force toujours le filtre par organisation
      organizationId: organizationId,
    };

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
      // ✅ SÉCURISÉ : Vérifie que le tag appartient à l'organisation
      const buildTags = await prisma.buildTag.findMany({
        where: {
          tagId,
          tag: {
            organizationId: organizationId
          }
        },
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

    // Récupérer la langue depuis les query params (défaut: "fr")
    const language = searchParams.get("language") || "fr";

    // Récupérer les métadonnées pour chaque build unique
    const uniqueBuilds = [...new Set(analytics.map(a => a.buildName))];
    const metadataMap = new Map();

    await Promise.all(
      uniqueBuilds.map(async (buildName) => {
        const session = analytics.find(a => a.buildName === buildName);
        if (session) {
          try {
            const metadata = await getMetadataForBuild(
              session.containerId,
              buildName,
              session.buildType
            );
            if (metadata) {
              metadataMap.set(buildName, metadata);
            }
          } catch (error) {
            console.warn(`No metadata for ${buildName}:`, error);
          }
        }
      })
    );

    // Enrichir les analytics avec les métadonnées
    // Cast les interactions depuis JsonValue vers InteractionData[]
    const analyticsWithTypedInteractions = analytics.map(a => ({
      ...a,
      interactions: a.interactions as unknown as InteractionData[],
    }));

    const enrichedAnalytics = enrichAnalyticsWithMetadata(
      analyticsWithTypedInteractions,
      metadataMap,
      language
    );

    // Calculer les métriques agrégées
    const aggregates = await prisma.trainingAnalytics.aggregate({
      where: whereConditions,
      _avg: {
        totalDuration: true,
        score: true,
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
          const key = questionData.questionKey;
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
    type EnrichedAnalytics = typeof enrichedAnalytics[number];
    const localeKey =
      language?.toLowerCase().startsWith("en") ? "en" : "fr";

    const response = {
      analytics: enrichedAnalytics.map((a: EnrichedAnalytics) => {
        const metadata = metadataMap.get(a.buildName) || null;
        let displayName = a.buildName;

        if (metadata?.title) {
          if (typeof metadata.title === "string") {
            displayName = metadata.title;
          } else {
            displayName =
              metadata.title[localeKey as keyof typeof metadata.title] ||
              metadata.title.fr ||
              metadata.title.en ||
              a.buildName;
          }
        }

        return {
          id: a.id,
          sessionId: a.sessionId,
          trainingId: a.trainingId,
          buildName: a.buildName,
          buildType: a.buildType,
          buildVersion: a.buildVersion || "1.0.0",
          user: a.user,
          startTime: a.startTime,
          endTime: a.endTime,
          totalDuration: a.totalDuration,
          completionStatus: a.completionStatus,
          score: a.score,
          totalInteractions: a.totalInteractions,
          successfulInteractions: a.successfulInteractions,
          failedInteractions: a.failedInteractions,
          interactions: a.interactions,
          metadata,
          displayName,
          imageUrl: metadata?.imageUrl || "",
        };
      }),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      aggregates: {
        totalSessions: aggregates._count.id || 0,
        averageDuration: aggregates._avg.totalDuration || 0,
        averageScore: aggregates._avg.score || 0,
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
});
