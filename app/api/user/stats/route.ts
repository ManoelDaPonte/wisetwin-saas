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

    // Récupérer les formations de l'utilisateur
    const userBuilds = await prisma.userBuild.findMany({
      where: {
        userId: targetUserId,
        containerId,
      },
      orderBy: { updatedAt: 'desc' },
      take: 50, // Limiter pour les performances
    });

    // Calculer les statistiques
    const completedBuilds = userBuilds.filter(b => b.completed);
    const wisetrainerCompletions = completedBuilds.filter(b => 
      b.buildType === 'WISETRAINER'
    ).length;

    const wisetourVisits = completedBuilds.filter(b => 
      b.buildType === 'WISETOUR'
    ).length;

    const totalFormationsCompleted = completedBuilds.length;
    // Supprimer totalFormationsStarted car on ne track plus les formations démarrées

    // Récupérer les analytics pour calculer temps total et moyenne des scores
    const trainingAnalytics = await prisma.trainingAnalytics.findMany({
      where: {
        userId: targetUserId,
        containerId,
        completionStatus: 'COMPLETED',
      },
    });

    // Calculer le temps total passé (en heures)
    const totalTimeSpentSeconds = trainingAnalytics.reduce(
      (sum, analytics) => sum + analytics.totalDuration,
      0
    );
    const totalTimeSpent = totalTimeSpentSeconds / 3600; // Convertir en heures

    // Calculer la moyenne des scores
    const averageScore = trainingAnalytics.length > 0
      ? trainingAnalytics.reduce((sum, analytics) => sum + analytics.successRate, 0) / trainingAnalytics.length
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
      score: analytics.completionStatus === 'COMPLETED' ? analytics.successRate : undefined,
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