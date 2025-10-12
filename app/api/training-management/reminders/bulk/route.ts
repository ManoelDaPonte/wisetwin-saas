import { NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { sendBulkTrainingReminderEmail } from "@/lib/email-service-reminders";
import { getUserInitials, getDisplayName } from "@/lib/user-utils";

// Configuration des envois
const BATCH_SIZE = 5; // Nombre d'emails envoyés en parallèle
const BATCH_DELAY = 50; // Délai entre chaque batch (ms)
const MAX_EMAILS_PER_REQUEST = 100;

// Cooldown global par organisation
const lastBulkSent = new Map<string, Date>();
const BULK_COOLDOWN_HOURS = 48; // 48 heures entre chaque rappel global

export const POST = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Vérifier les permissions (seuls OWNER et ADMIN peuvent envoyer des rappels)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission d'envoyer des rappels" },
        { status: 403 }
      );
    }

    // Vérifier le cooldown global
    const lastSent = lastBulkSent.get(request.organization.id);
    if (lastSent) {
      const hoursSinceLastBulk = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastBulk < BULK_COOLDOWN_HOURS) {
        const remainingHours = Math.ceil(BULK_COOLDOWN_HOURS - hoursSinceLastBulk);
        return NextResponse.json(
          { error: `Un rappel global a déjà été envoyé récemment. Prochain rappel possible dans ${remainingHours} heures.` },
          { status: 429 }
        );
      }
    }

    // Récupérer tous les plans actifs de l'organisation avec leurs membres et formations
    const tags = await prisma.trainingTag.findMany({
      where: {
        organizationId: request.organization.id,
      },
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

    if (tags.length === 0) {
      return NextResponse.json(
        { error: "Aucun plan de formation trouvé" },
        { status: 404 }
      );
    }

    // Récupérer tous les membres uniques assignés à au moins un plan
    const uniqueMembers = new Map<string, any>();
    const memberTags = new Map<string, string[]>(); // userId -> tagIds[]

    tags.forEach(tag => {
      tag.memberTags.forEach(mt => {
        uniqueMembers.set(mt.userId, mt.user);
        if (!memberTags.has(mt.userId)) {
          memberTags.set(mt.userId, []);
        }
        memberTags.get(mt.userId)?.push(tag.id);
      });
    });

    if (uniqueMembers.size === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucun membre assigné aux plans de formation",
        details: {
          totalPlans: tags.length,
          notified: 0,
        }
      });
    }

    // Limiter le nombre d'emails
    if (uniqueMembers.size > MAX_EMAILS_PER_REQUEST) {
      return NextResponse.json(
        {
          error: `Trop de membres à notifier (${uniqueMembers.size}). Maximum ${MAX_EMAILS_PER_REQUEST} par requête.`,
          suggestion: "Divisez l'envoi en plusieurs requêtes ou contactez le support."
        },
        { status: 400 }
      );
    }

    // Récupérer tous les analytics pour déterminer les progressions
    const allBuildNames = new Set<string>();
    tags.forEach(tag => {
      tag.buildTags.forEach(bt => allBuildNames.add(bt.buildName));
    });

    const allAnalytics = await prisma.trainingAnalytics.findMany({
      where: {
        buildName: { in: Array.from(allBuildNames) },
        completionStatus: "COMPLETED",
        userId: { in: Array.from(uniqueMembers.keys()) }
      },
      distinct: ["userId", "buildName"],
    });

    // Organiser les completions par utilisateur et build
    const completionsByUser = new Map<string, Set<string>>();
    allAnalytics.forEach(analytic => {
      if (!completionsByUser.has(analytic.userId)) {
        completionsByUser.set(analytic.userId, new Set());
      }
      completionsByUser.get(analytic.userId)?.add(analytic.buildName);
    });

    // Envoyer les emails
    const results = {
      success: [] as string[],
      failed: [] as { email: string; error: string }[],
      alreadyCompleted: [] as string[],
    };

    // Préparer tous les emails à envoyer
    const emailTasks: Array<{userId: string, user: any}> = [];

    for (const [userId, user] of uniqueMembers.entries()) {
      const userTagIds = memberTags.get(userId) || [];
      const userTags = tags.filter(tag => userTagIds.includes(tag.id));
      const userCompletions = completionsByUser.get(userId) || new Set();

      // Préparer les données pour chaque plan du membre
      const plansData = userTags.map(tag => {
        const buildNames = tag.buildTags.map(bt => bt.buildName);
        const formations = buildNames.map(buildName => ({
          name: buildName,
          status: userCompletions.has(buildName) ? "completed" as const : "not_started" as const
        }));

        const completedCount = buildNames.filter(bn => userCompletions.has(bn)).length;
        const totalCount = buildNames.length;

        return {
          color: tag.color || undefined,
          dueDate: tag.dueDate,
          completedCount,
          totalCount,
          formations,
        };
      });

      // Filtrer les plans non terminés
      const incompletePlans = plansData.filter(plan => plan.completedCount < plan.totalCount);

      if (incompletePlans.length === 0) {
        results.alreadyCompleted.push(user.email);
        continue;
      }

      emailTasks.push({ userId, user });
    }

    // Envoyer les emails par batch en parallèle
    for (let i = 0; i < emailTasks.length; i += BATCH_SIZE) {
      const batch = emailTasks.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async ({ userId, user }) => {
        try {
          const userTagIds = memberTags.get(userId) || [];
          const userTags = tags.filter(tag => userTagIds.includes(tag.id));
          const userCompletions = completionsByUser.get(userId) || new Set();

          // Préparer les données pour chaque plan du membre
          const plansData = userTags.map(tag => {
            const buildNames = tag.buildTags.map(bt => bt.buildName);
            const formations = buildNames.map(buildName => ({
              name: buildName,
              status: userCompletions.has(buildName) ? "completed" as const : "not_started" as const
            }));

            const completedCount = buildNames.filter(bn => userCompletions.has(bn)).length;
            const totalCount = buildNames.length;

            return {
              color: tag.color || undefined,
              dueDate: tag.dueDate,
              completedCount,
              totalCount,
              formations,
            };
          });

          // Filtrer les plans non terminés
          const incompletePlans = plansData.filter(plan => plan.completedCount < plan.totalCount);

          // Envoyer l'email avec tous les plans en cours
          await sendBulkTrainingReminderEmail({
            email: user.email,
            memberName: getDisplayName(user),
            organizationName: request.organization.name,
            plans: incompletePlans,
          });

          results.success.push(user.email);
        } catch (error) {
          console.error(`Failed to send bulk reminder to ${user.email}:`, error);
          results.failed.push({
            email: user.email,
            error: error instanceof Error ? error.message : "Erreur inconnue"
          });
        }
      });

      // Attendre que tous les emails du batch soient envoyés
      await Promise.all(batchPromises);

      // Petit délai entre les batches pour éviter de surcharger
      if (i + BATCH_SIZE < emailTasks.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    // Mettre à jour le cooldown
    if (results.success.length > 0) {
      lastBulkSent.set(request.organization.id, new Date());
    }

    // Logger l'envoi global
    console.log(`Bulk reminder sent by ${request.user.email}. Success: ${results.success.length}, Failed: ${results.failed.length}, Already completed: ${results.alreadyCompleted.length}`);

    return NextResponse.json({
      success: true,
      message: "Rappels globaux envoyés",
      details: {
        totalPlans: tags.length,
        totalMembers: uniqueMembers.size,
        notified: results.success.length,
        failed: results.failed.length,
        alreadyCompleted: results.alreadyCompleted.length,
        failedEmails: results.failed,
        summary: {
          plansWithMembers: tags.filter(t => t.memberTags.length > 0).length,
          totalAssignments: tags.reduce((sum, tag) => sum + tag.memberTags.length, 0),
        }
      }
    });
  } catch (error) {
    console.error("Error sending bulk reminders:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi des rappels globaux" },
      { status: 500 }
    );
  }
});