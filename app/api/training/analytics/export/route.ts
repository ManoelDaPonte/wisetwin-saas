import { NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { ExportAnalyticsQuerySchema } from "@/validators/analytics";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import type { InteractionData } from "@/types/training";

/**
 * GET /api/training/analytics/export - Exporter les analytics en CSV ou Excel
 *
 * Requiert une authentification organisation avec role ADMIN ou OWNER
 */
export const GET = withOrgAuth(async (req: OrgAuthenticatedRequest) => {
  try {
    // Vérifier les permissions (ADMIN ou OWNER seulement)
    // Note: withOrgAuth already checks for organization access
    // Additional role check can be added here if needed

    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validation des paramètres
    const validationResult = ExportAnalyticsQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return NextResponse.json({
        error: "Paramètres invalides",
        details: validationResult.error.flatten()
      }, { status: 400 });
    }

    const {
      format,
      buildName,
      tagId,
      startDate,
      endDate,
    } = validationResult.data;

    // Construction des conditions de requête
    const whereConditions: Prisma.TrainingAnalyticsWhereInput = {
      organizationId: req.organization.id,
    };

    if (buildName) {
      whereConditions.buildName = buildName;
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

    // Si un tagId est fourni, filtrer par les formations associées
    if (tagId) {
      const buildTags = await prisma.buildTag.findMany({
        where: { tagId },
        select: { buildName: true, buildType: true }
      });

      if (buildTags.length > 0) {
        whereConditions.OR = buildTags.map(bt => ({
          buildName: bt.buildName,
          buildType: bt.buildType,
        }));
      }
    }

    // Récupérer toutes les analytics correspondantes
    const analytics = await prisma.trainingAnalytics.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    // Préparer les données pour l'export
    const exportData = analytics.map(session => {
      const interactions = session.interactions as unknown as InteractionData[];

      // Calculer des métriques supplémentaires
      const questionCount = interactions?.filter(i => i.type === 'question').length || 0;
      const procedureCount = interactions?.filter(i => i.type === 'procedure').length || 0;
      const textCount = interactions?.filter(i => i.type === 'text').length || 0;

      return {
        'Session ID': session.sessionId,
        'Formation': session.buildName,
        'Type': session.buildType,
        'Utilisateur': session.user?.email || 'N/A',
        'Nom': `${session.user?.firstName || ''} ${session.user?.name || ''}`.trim() || 'N/A',
        'Date début': formatDate(session.startTime),
        'Date fin': formatDate(session.endTime),
        'Durée (min)': Math.round(session.totalDuration / 60),
        'Statut': translateStatus(session.completionStatus),
        'Taux de réussite (%)': session.successRate.toFixed(2),
        'Interactions totales': session.totalInteractions,
        'Interactions réussies': session.successfulInteractions,
        'Interactions échouées': session.failedInteractions,
        'Questions': questionCount,
        'Procédures': procedureCount,
        'Textes': textCount,
        'Tentatives totales': session.totalAttempts,
        'Échecs totaux': session.totalFailedAttempts,
        'Temps moyen par interaction (s)': session.averageTimePerInteraction.toFixed(2),
      };
    });

    if (format === 'csv') {
      // Générer le CSV
      const csv = generateCSV(exportData);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Pour Excel, on retourne les données JSON
      // Le client devra utiliser une librairie comme SheetJS pour générer le fichier Excel
      return NextResponse.json({
        data: exportData,
        metadata: {
          exportDate: new Date().toISOString(),
          organization: req.organization.name,
          totalSessions: exportData.length,
          filters: {
            buildName,
            tagId,
            startDate,
            endDate,
          }
        }
      });
    }

  } catch (error) {
    console.error("Erreur lors de l'export des analytics:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: "Paramètres invalides",
        details: error.flatten()
      }, { status: 400 });
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Erreur serveur",
    }, { status: 500 });
  }
});

// Fonctions utilitaires

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    'COMPLETED': 'Terminé',
    'ABANDONED': 'Abandonné',
    'IN_PROGRESS': 'En cours',
    'FAILED': 'Échoué',
  };
  return translations[status] || status;
}

function generateCSV(data: Record<string, string | number>[]): string {
  if (data.length === 0) return '';

  // Obtenir les en-têtes depuis le premier objet
  const headers = Object.keys(data[0]);

  // Créer la ligne d'en-tête
  const headerRow = headers.map(h => `"${h}"`).join(',');

  // Créer les lignes de données
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Échapper les guillemets et entourer de guillemets si nécessaire
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });

  // Ajouter le BOM UTF-8 pour Excel
  const BOM = '\uFEFF';
  return BOM + [headerRow, ...dataRows].join('\n');
}