import { NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { sendTrainingReminderEmail } from "@/lib/email-service-reminders";
import { getDisplayName } from "@/lib/user-utils";

// Configuration des envois
const BATCH_SIZE = 5; // Nombre d'emails envoyés en parallèle
const BATCH_DELAY = 30; // Délai entre chaque batch (ms)
const MAX_EMAILS_PER_REQUEST = 50;

export const POST = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Vérifier les permissions (seuls OWNER et ADMIN peuvent envoyer des rappels)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission d'envoyer des rappels" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tagId } = body;

    // Validation
    if (!tagId) {
      return NextResponse.json(
        { error: "ID du plan requis" },
        { status: 400 }
      );
    }

    // Récupérer le plan (tag) avec ses membres et formations
    const tag = await prisma.trainingTag.findUnique({
      where: { id: tagId },
      include: {
        buildTags: true,
        memberTags: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                name: true,
              }
            }
          }
        }
      }
    });

    if (!tag || tag.organizationId !== request.organization.id) {
      return NextResponse.json(
        { error: "Plan de formation non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les formations du plan
    const buildNames = tag.buildTags.map(bt => bt.buildName);

    if (buildNames.length === 0) {
      return NextResponse.json(
        { error: "Aucune formation assignée à ce plan" },
        { status: 400 }
      );
    }

    // Récupérer tous les analytics pour ces formations
    const allAnalytics = await prisma.trainingAnalytics.findMany({
      where: {
        buildName: { in: buildNames },
        completionStatus: "COMPLETED",
        userId: { in: tag.memberTags.map(mt => mt.userId) }
      },
      distinct: ["userId", "buildName"],
    });

    // Organiser les completions par utilisateur
    const completionsByUser = new Map<string, Set<string>>();
    allAnalytics.forEach(analytic => {
      if (!completionsByUser.has(analytic.userId)) {
        completionsByUser.set(analytic.userId, new Set());
      }
      completionsByUser.get(analytic.userId)?.add(analytic.buildName);
    });

    // Filtrer les membres qui n'ont pas terminé toutes les formations
    const membersToNotify = tag.memberTags.filter(memberTag => {
      const completedBuilds = completionsByUser.get(memberTag.userId) || new Set();
      return completedBuilds.size < buildNames.length;
    });

    if (membersToNotify.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tous les membres ont déjà terminé ce plan",
        details: {
          plan: tag.name,
          totalMembers: tag.memberTags.length,
          notified: 0,
        }
      });
    }

    // Limiter le nombre d'emails
    if (membersToNotify.length > MAX_EMAILS_PER_REQUEST) {
      return NextResponse.json(
        {
          error: `Trop de membres à notifier (${membersToNotify.length}). Maximum ${MAX_EMAILS_PER_REQUEST} par requête.`,
          suggestion: "Utilisez le rappel global pour notifier tous les membres."
        },
        { status: 400 }
      );
    }

    // Envoyer les emails
    const results = {
      success: [] as string[],
      failed: [] as { email: string; error: string }[],
    };

    // Envoyer les emails par batch en parallèle
    for (let i = 0; i < membersToNotify.length; i += BATCH_SIZE) {
      const batch = membersToNotify.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async (memberTag) => {
        try {
          const completedBuilds = completionsByUser.get(memberTag.userId) || new Set();

          // Préparer les données des formations
          const formations = buildNames.map(buildName => ({
            name: buildName,
            status: completedBuilds.has(buildName) ? "completed" as const : "not_started" as const
          }));

          const completedCount = completedBuilds.size;
          const totalCount = buildNames.length;

          // Envoyer l'email
          await sendTrainingReminderEmail({
            email: memberTag.user.email,
            memberName: getDisplayName(memberTag.user),
            organizationName: request.organization.name,
            planColor: tag.color || undefined,
            dueDate: tag.dueDate,
            formations,
            completedCount,
            totalCount,
          });

          results.success.push(memberTag.user.email);
        } catch (error) {
          console.error(`Failed to send reminder to ${memberTag.user.email}:`, error);
          results.failed.push({
            email: memberTag.user.email,
            error: error instanceof Error ? error.message : "Erreur inconnue"
          });
        }
      });

      // Attendre que tous les emails du batch soient envoyés
      await Promise.all(batchPromises);

      // Petit délai entre les batches pour éviter de surcharger
      if (i + BATCH_SIZE < membersToNotify.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    // Logger l'envoi groupé
    console.log(`Tag reminder sent for plan ${tag.name} by ${request.user.email}. Success: ${results.success.length}, Failed: ${results.failed.length}`);

    return NextResponse.json({
      success: true,
      message: `Rappels envoyés pour le plan "${tag.name}"`,
      details: {
        plan: tag.name,
        totalMembers: tag.memberTags.length,
        membersToNotify: membersToNotify.length,
        notified: results.success.length,
        failed: results.failed.length,
        failedEmails: results.failed,
      }
    });
  } catch (error) {
    console.error("Error sending tag reminders:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi des rappels" },
      { status: 500 }
    );
  }
});