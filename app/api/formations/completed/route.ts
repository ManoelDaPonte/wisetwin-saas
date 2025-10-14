import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { Prisma, BuildType as PrismaBuildType, CompletionStatus } from "@prisma/client";
import { BuildType } from "@/types/azure";

// POST /api/formations/completed - Marquer une formation comme terminée (appelé depuis Unity)
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { buildName, buildType, containerId } = body;
    console.log(buildName, buildType, containerId)

    // Validation des paramètres requis
    if (!buildName || !buildType || !containerId) {
      return NextResponse.json(
        { error: "buildName, buildType et containerId sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que le buildType est valide
    const validBuildTypes = ["wisetour", "wisetrainer"];
    if (!validBuildTypes.includes(buildType.toLowerCase())) {
      return NextResponse.json(
        { error: "buildType doit être 'wisetour' ou 'wisetrainer'" },
        { status: 400 }
      );
    }

    // Vérifier l'accès au container (même logique que dans /api/builds/route.ts)
    if (containerId.startsWith("personal-")) {
      if (containerId !== req.user.azureContainerId) {
        return NextResponse.json(
          { error: "Accès refusé à ce container personnel" },
          { status: 403 }
        );
      }
    } else {
      // Container d'organisation
      const org = await prisma.organization.findFirst({
        where: { azureContainerId: containerId },
      });

      if (!org) {
        return NextResponse.json(
          { error: "Organisation non trouvée" },
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
          { error: "Accès refusé à cette organisation" },
          { status: 403 }
        );
      }
    }

    // Note : Cette route est obsolète car les completions sont maintenant
    // enregistrées automatiquement via TrainingAnalytics depuis Unity.
    // On garde cette route pour compatibilité mais elle ne devrait plus être appelée.

    return NextResponse.json({
      success: true,
      message: "Cette route est obsolète. Les formations sont maintenant automatiquement marquées comme terminées via TrainingAnalytics.",
      deprecated: true,
    });

  } catch (error) {
    console.error("Erreur lors du marquage de la formation comme terminée:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 }
    );
  }
});

// GET /api/formations/completed - Récupérer les formations terminées de l'utilisateur
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const buildType = searchParams.get("buildType") as BuildType;
    const containerId = searchParams.get("containerId");

    // Construire les conditions de la requête
    const whereConditions: Prisma.TrainingAnalyticsWhereInput = {
      userId: req.user.id,
      completionStatus: CompletionStatus.COMPLETED,
    };

    if (buildType) {
      if (!["wisetour", "wisetrainer"].includes(buildType.toLowerCase())) {
        return NextResponse.json(
          { error: "buildType doit être 'wisetour' ou 'wisetrainer'" },
          { status: 400 }
        );
      }
      whereConditions.buildType =
        buildType.toUpperCase() as PrismaBuildType;
    }

    if (containerId) {
      whereConditions.containerId = containerId;
    }

    // Récupérer les formations terminées depuis TrainingAnalytics
    const completedAnalytics = await prisma.trainingAnalytics.findMany({
      where: whereConditions,
      orderBy: {
        endTime: "desc", // Plus récentes en premier
      }
    });

    // Grouper par formation unique pour éviter les doublons
    const uniqueCompletions = new Map<string, typeof completedAnalytics[0]>();
    completedAnalytics.forEach(analytics => {
      const key = `${analytics.buildName}-${analytics.buildType}-${analytics.containerId}`;
      const existing = uniqueCompletions.get(key);

      // Garder la plus récente complétion
      if (!existing || new Date(analytics.endTime) > new Date(existing.endTime)) {
        uniqueCompletions.set(key, analytics);
      }
    });

    // Formater les données pour l'interface (format compatible avec l'ancien UserBuild)
    const formattedCompletions = Array.from(uniqueCompletions.values()).map(analytics => ({
      id: analytics.id,
      buildName: analytics.buildName,
      buildType: analytics.buildType,
      containerId: analytics.containerId,
      progress: 100, // Toujours 100 pour une formation complétée
      completedAt: analytics.endTime,
      startedAt: analytics.startTime,
      lastAccessedAt: analytics.endTime,
    }));

    return NextResponse.json({
      completions: formattedCompletions,
      total: formattedCompletions.length,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des formations terminées:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 }
    );
  }
});
