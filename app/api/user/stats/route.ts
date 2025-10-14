import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const containerId = searchParams.get("containerId");
    const organizationId = searchParams.get("organizationId");
    const userId = searchParams.get("userId");

    if (!containerId) {
      return NextResponse.json(
        { error: "Container ID requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur demande ses propres stats ou est admin de l'org
    if (userId !== session.user.id) {
      if (organizationId) {
        const membership = await prisma.organizationMember.findUnique({
          where: {
            userId_organizationId: {
              userId: session.user.id,
              organizationId,
            },
          },
        });

        if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
          return NextResponse.json(
            { error: "Accès non autorisé" },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Accès non autorisé" },
          { status: 403 }
        );
      }
    }

    const targetUserId = userId || session.user.id;

    // Récupérer les analytics complétés pour calculer les statistiques
    const completedAnalytics = await prisma.trainingAnalytics.findMany({
      where: {
        userId: targetUserId,
        containerId,
        completionStatus: 'COMPLETED',
      },
    });

    // Grouper par formation unique (buildName + buildType) pour éviter les doublons
    const uniqueCompletions = new Map<string, typeof completedAnalytics[0]>();
    completedAnalytics.forEach(analytics => {
      const key = `${analytics.buildName}-${analytics.buildType}`;
      const existing = uniqueCompletions.get(key);

      // Garder la plus récente complétion pour chaque formation unique
      if (!existing || new Date(analytics.endTime) > new Date(existing.endTime)) {
        uniqueCompletions.set(key, analytics);
      }
    });

    const uniqueCompletionsArray = Array.from(uniqueCompletions.values());

    // Calculer les statistiques à partir des formations uniques
    const totalFormationsCompleted = uniqueCompletionsArray.length;
    const wisetrainerCompletions = uniqueCompletionsArray.filter(a =>
      a.buildType === 'WISETRAINER'
    ).length;
    const wisetourVisits = uniqueCompletionsArray.filter(a =>
      a.buildType === 'WISETOUR'
    ).length;

    // Calculer le temps total passé (en heures) depuis toutes les analytics
    const totalTimeSpentSeconds = completedAnalytics.reduce(
      (sum, analytics) => sum + analytics.totalDuration,
      0
    );
    const totalTimeSpent = totalTimeSpentSeconds / 3600; // Convertir en heures

    // Calculer la moyenne des scores depuis toutes les analytics
    const averageScore = completedAnalytics.length > 0
      ? completedAnalytics.reduce((sum, analytics) => sum + analytics.score, 0) / completedAnalytics.length
      : 0;

    // Récupérer TOUTES les activités depuis TrainingAnalytics pour l'historique complet
    // Cela inclut toutes les tentatives, même multiples sur la même formation
    const allAnalytics = await prisma.trainingAnalytics.findMany({
      where: {
        userId: targetUserId,
        containerId,
      },
      orderBy: { endTime: 'desc' },
      take: 50, // Limiter pour les performances
    });

    // Activité récente - toutes les activités, même duplications
    const recentActivity = allAnalytics.slice(0, 10).map(analytics => ({
      id: analytics.id,
      type: 'completion' as const,
      buildName: analytics.buildName,
      buildType: analytics.buildType.toLowerCase() as 'wisetrainer' | 'wisetour',
      timestamp: analytics.endTime.toISOString(),
      score: analytics.completionStatus === 'COMPLETED' ? analytics.score : undefined,
      // imageUrl sera ajouté par le hook use-recent-activity-with-details
    }));

    const userStats = {
      totalFormationsCompleted,
      wisetrainerCompletions,
      wisetourVisits,
      totalTimeSpent, // en heures
      averageScore, // pourcentage
      recentActivity,
    };

    return NextResponse.json(userStats);

  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}