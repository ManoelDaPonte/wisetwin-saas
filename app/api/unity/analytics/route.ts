import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateTrainingAnalyticsSchema } from "@/validators/analytics";
import { validateUnityToken } from "@/lib/unity-token";
import { z } from "zod";
import { Prisma } from "@prisma/client";

/**
 * API publique pour Unity - Réception des analytics de formation
 *
 * POST /api/unity/analytics
 *
 * Cette route est publique car Unity WebGL ne peut pas s'authentifier
 * Sécurité : validation stricte des données et du containerId
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données avec Zod
    const validationResult = CreateTrainingAnalyticsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Données invalides",
        details: validationResult.error.flatten()
      }, { status: 400 });
    }

    const data = validationResult.data;

    // Identifier l'utilisateur et l'organisation
    let organizationId: string | null = null;
    let userId: string | null = null;

    // Vérifier si un token est fourni
    const authToken = data.authToken || request.headers.get('X-Unity-Token');

    if (authToken) {
      // Nouveau système avec token
      const validation = await validateUnityToken(authToken);

      if (!validation.valid) {
        return NextResponse.json({
          success: false,
          error: validation.error || "Token invalide"
        }, { status: 401 });
      }

      userId = validation.userId!;
      organizationId = validation.organizationId || null;

    } else {
      // Ancien système (fallback pour compatibilité)
      console.warn("Analytics reçues sans token - mode fallback");

      if (data.containerId.startsWith("personal-")) {
        // Container personnel
        const user = await prisma.user.findFirst({
          where: { azureContainerId: data.containerId }
        });

        if (!user) {
          return NextResponse.json({
            success: false,
            error: "Container personnel non trouvé"
          }, { status: 404 });
        }

        userId = user.id;
      } else {
        // Container d'organisation - impossible d'identifier l'utilisateur sans token
        return NextResponse.json({
          success: false,
          error: "Token requis pour les containers d'organisation",
          details: "Veuillez mettre à jour Unity pour inclure le token d'authentification"
        }, { status: 401 });
      }
    }

    // Vérifier si une session avec cet ID existe déjà
    const existingSession = await prisma.trainingAnalytics.findUnique({
      where: { sessionId: data.sessionId }
    });

    if (existingSession) {
      // Mettre à jour la session existante
      const updatedAnalytics = await prisma.trainingAnalytics.update({
        where: { sessionId: data.sessionId },
        data: {
          endTime: new Date(data.endTime),
          totalDuration: data.totalDuration,
          completionStatus: data.completionStatus as "COMPLETED" | "IN_PROGRESS" | "ABANDONED" | "FAILED",
          totalInteractions: data.summary.totalInteractions,
          successfulInteractions: data.summary.successfulInteractions,
          failedInteractions: data.summary.failedInteractions,
          averageTimePerInteraction: data.summary.averageTimePerInteraction,
          totalAttempts: data.summary.totalAttempts,
          totalFailedAttempts: data.summary.totalFailedAttempts,
          successRate: data.summary.successRate,
          interactions: data.interactions as Prisma.JsonArray,
        }
      });

      // Si la formation est terminée, mettre à jour UserBuild
      if (data.completionStatus === "COMPLETED" && userId) {
        await prisma.userBuild.upsert({
          where: {
            userId_buildName_buildType_containerId: {
              userId,
              buildName: data.buildName,
              buildType: data.buildType as "WISETOUR" | "WISETRAINER",
              containerId: data.containerId,
            }
          },
          update: {
            completed: true,
            completedAt: new Date(data.endTime),
            progress: 100,
            lastAccessedAt: new Date(),
          },
          create: {
            userId,
            buildName: data.buildName,
            buildType: data.buildType as "WISETOUR" | "WISETRAINER",
            containerId: data.containerId,
            completed: true,
            completedAt: new Date(data.endTime),
            progress: 100,
            startedAt: new Date(data.startTime),
            lastAccessedAt: new Date(),
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: "Analytics mises à jour",
        sessionId: updatedAnalytics.sessionId
      });

    } else {
      // Créer une nouvelle session d'analytics

      // Vérifier qu'on a bien un userId
      if (!userId) {
        return NextResponse.json({
          success: false,
          error: "Utilisateur non identifié",
          details: "Un token d'authentification est requis"
        }, { status: 401 });
      }

      const newAnalytics = await prisma.trainingAnalytics.create({
        data: {
          sessionId: data.sessionId,
          trainingId: data.trainingId,
          userId,
          organizationId,
          buildName: data.buildName,
          buildType: data.buildType as "WISETOUR" | "WISETRAINER",
          containerId: data.containerId,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          totalDuration: data.totalDuration,
          completionStatus: data.completionStatus as "COMPLETED" | "IN_PROGRESS" | "ABANDONED" | "FAILED",
          totalInteractions: data.summary.totalInteractions,
          successfulInteractions: data.summary.successfulInteractions,
          failedInteractions: data.summary.failedInteractions,
          averageTimePerInteraction: data.summary.averageTimePerInteraction,
          totalAttempts: data.summary.totalAttempts,
          totalFailedAttempts: data.summary.totalFailedAttempts,
          successRate: data.summary.successRate,
          interactions: data.interactions as Prisma.JsonArray,
        }
      });

      // Si la formation est terminée, mettre à jour UserBuild
      if (data.completionStatus === "COMPLETED") {
        await prisma.userBuild.upsert({
          where: {
            userId_buildName_buildType_containerId: {
              userId,
              buildName: data.buildName,
              buildType: data.buildType as "WISETOUR" | "WISETRAINER",
              containerId: data.containerId,
            }
          },
          update: {
            completed: true,
            completedAt: new Date(data.endTime),
            progress: 100,
            lastAccessedAt: new Date(),
          },
          create: {
            userId,
            buildName: data.buildName,
            buildType: data.buildType as "WISETOUR" | "WISETRAINER",
            containerId: data.containerId,
            completed: true,
            completedAt: new Date(data.endTime),
            progress: 100,
            startedAt: new Date(data.startTime),
            lastAccessedAt: new Date(),
          }
        });

        // Mettre à jour TrainingCompletion si applicable
        const buildTag = await prisma.buildTag.findFirst({
          where: {
            buildName: data.buildName,
            buildType: data.buildType as "WISETOUR" | "WISETRAINER",
            containerId: data.containerId,
          }
        });

        if (buildTag) {
          await prisma.trainingCompletion.updateMany({
            where: {
              buildTagId: buildTag.id,
              userId,
            },
            data: {
              status: "COMPLETED",
              completedAt: new Date(data.endTime),
            }
          });
        }
      }

      console.log(`[Unity Analytics] Nouvelle session créée: ${newAnalytics.sessionId}`);

      return NextResponse.json({
        success: true,
        message: "Analytics enregistrées",
        sessionId: newAnalytics.sessionId
      });
    }

  } catch (error) {
    console.error("Erreur API Unity analytics:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Données invalides",
        details: error.flatten()
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: "Erreur serveur interne"
    }, { status: 500 });
  }
}

/**
 * OPTIONS - Pour gérer CORS depuis Unity
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 heures
    },
  });
}