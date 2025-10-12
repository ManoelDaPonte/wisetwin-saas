import { NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { sendTrainingReminderEmail } from "@/lib/email-service-reminders";
import { getUserInitials, getDisplayName } from "@/lib/user-utils";

// Rate limiting: Store last email sent time per user
const lastEmailSent = new Map<string, Date>();
const COOLDOWN_HOURS = 24;

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
    const { memberId, tagId } = body;

    // Validation
    if (!memberId || !tagId) {
      return NextResponse.json(
        { error: "ID du membre et ID du plan requis" },
        { status: 400 }
      );
    }

    // Vérifier le cooldown
    const cooldownKey = `${memberId}-${tagId}`;
    const lastSent = lastEmailSent.get(cooldownKey);
    if (lastSent) {
      const hoursSinceLastEmail = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastEmail < COOLDOWN_HOURS) {
        const remainingHours = Math.ceil(COOLDOWN_HOURS - hoursSinceLastEmail);
        return NextResponse.json(
          { error: `Un rappel a déjà été envoyé récemment. Prochain rappel possible dans ${remainingHours} heures.` },
          { status: 429 }
        );
      }
    }

    // Récupérer le membre
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        email: true,
        firstName: true,
        name: true,
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer le plan (tag)
    const tag = await prisma.trainingTag.findUnique({
      where: { id: tagId },
      include: {
        buildTags: true,
      }
    });

    if (!tag) {
      return NextResponse.json(
        { error: "Plan de formation non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le membre est bien assigné à ce plan
    const memberTag = await prisma.memberTag.findUnique({
      where: {
        userId_tagId: {
          userId: memberId,
          tagId: tagId,
        }
      }
    });

    if (!memberTag) {
      return NextResponse.json(
        { error: "Le membre n'est pas assigné à ce plan" },
        { status: 400 }
      );
    }

    // Récupérer les formations du plan
    const buildNames = tag.buildTags.map(bt => bt.buildName);

    // Récupérer les analytics pour ce membre et ces formations
    const analytics = await prisma.trainingAnalytics.findMany({
      where: {
        userId: memberId,
        buildName: { in: buildNames },
        completionStatus: "COMPLETED",
      },
      distinct: ["buildName"],
    });

    const completedBuildNames = new Set(analytics.map(a => a.buildName));

    // Préparer les données des formations
    const formations = buildNames.map(buildName => ({
      name: buildName,
      status: completedBuildNames.has(buildName) ? "completed" as const : "not_started" as const
    }));

    const completedCount = completedBuildNames.size;
    const totalCount = buildNames.length;

    // Envoyer l'email
    await sendTrainingReminderEmail({
      email: member.email,
      memberName: getDisplayName(member),
      organizationName: request.organization.name,
      planColor: tag.color || undefined,
      dueDate: tag.dueDate,
      formations,
      completedCount,
      totalCount,
    });

    // Mettre à jour le cooldown
    lastEmailSent.set(cooldownKey, new Date());

    // Logger l'envoi
    console.log(`Reminder sent to ${member.email} for plan ${tag.name} by ${request.user.email}`);

    return NextResponse.json({
      success: true,
      message: "Rappel envoyé avec succès",
      details: {
        member: member.email,
        plan: tag.name,
        progression: `${completedCount}/${totalCount}`,
      }
    });
  } catch (error) {
    console.error("Error sending individual reminder:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du rappel" },
      { status: 500 }
    );
  }
});