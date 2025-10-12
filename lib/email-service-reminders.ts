import { transporter } from "./email-service";
import { env } from "@/lib/env";

// Fonction pour obtenir l'URL de base selon l'environnement
function getBaseUrl() {
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL;
  }

  if (env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return "https://app.wisetwin.com";
}

// Interface pour les données de rappel de formation
export interface TrainingReminderData {
  email: string;
  memberName: string;
  organizationName: string;
  planColor?: string;
  dueDate?: Date | null;
  formations: Array<{
    name: string;
    status: "completed" | "in_progress" | "not_started";
  }>;
  completedCount: number;
  totalCount: number;
}

// Fonction pour envoyer un rappel de formation individuel
export async function sendTrainingReminderEmail(data: TrainingReminderData) {
  const baseUrl = getBaseUrl();
  const dashboardUrl = `${baseUrl}/organisation/plan-de-formation`;

  // Calculer le pourcentage de progression
  const progressPercentage = data.totalCount > 0
    ? Math.round((data.completedCount / data.totalCount) * 100)
    : 0;

  // Formater la date limite si elle existe
  const dueDateText = data.dueDate
    ? `Échéance : ${new Date(data.dueDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}`
    : null;

  // Calculer les jours restants si date limite
  const daysRemaining = data.dueDate
    ? Math.ceil((new Date(data.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const info = await transporter.sendMail({
    from: '"WiseTwin" <no-reply@wisetwin.eu>',
    replyTo: "support@wisetwin.eu",
    to: data.email,
    subject: `Rappel : Formations en cours - ${data.organizationName}`,
    headers: {
      "X-Mailer": "WiseTwin",
      "X-Priority": "3",
    },
    text: `
Bonjour ${data.memberName},

Ceci est un rappel concernant vos formations en cours dans l'organisation ${data.organizationName}.

Progression actuelle : ${data.completedCount}/${data.totalCount} formations terminées (${progressPercentage}%)
${dueDateText ? dueDateText : ''}
${daysRemaining !== null && daysRemaining >= 0 ? `Il vous reste ${daysRemaining} jours pour terminer ces formations.` : ''}
${daysRemaining !== null && daysRemaining < 0 ? `Ces formations sont en retard de ${Math.abs(daysRemaining)} jours.` : ''}

Formations restantes à compléter :
${data.formations.filter(f => f.status !== 'completed').map(f => `- ${f.name}`).join('\n')}

Connectez-vous pour continuer votre parcours de formation :
${dashboardUrl}

L'équipe WiseTwin
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="display: inline-block; width: 80px; height: 80px; background: ${data.planColor || '#667eea'}; border-radius: 16px; text-align: center; line-height: 80px; font-size: 36px; color: white; font-weight: bold; margin-bottom: 16px;">
                📚
              </div>
              <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700;">
                Rappel : Formations en cours
              </h1>
              <p style="margin: 8px 0 0; color: #6b7280; font-size: 16px;">
                ${data.organizationName}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 24px;">
                Bonjour ${data.memberName},
              </p>
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 24px;">
                Ceci est un rappel concernant vos formations en cours dans l'organisation <strong>${data.organizationName}</strong>.
              </p>

              <!-- Progress Bar -->
              <div style="margin: 24px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                <p style="margin: 0 0 12px; color: #374151; font-size: 14px; font-weight: 600;">
                  Progression actuelle :
                </p>
                <div style="width: 100%; height: 24px; background-color: #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 8px;">
                  <div style="width: ${progressPercentage}%; height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); transition: width 0.3s;"></div>
                </div>
                <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px; text-align: center;">
                  ${data.completedCount} sur ${data.totalCount} formations terminées (${progressPercentage}%)
                </p>
              </div>

              ${dueDateText ? `
              <!-- Due Date Alert -->
              <div style="background-color: ${daysRemaining !== null && daysRemaining < 0 ? '#fef2f2' : daysRemaining !== null && daysRemaining <= 7 ? '#fef3c7' : '#f0f9ff'}; border: 1px solid ${daysRemaining !== null && daysRemaining < 0 ? '#fecaca' : daysRemaining !== null && daysRemaining <= 7 ? '#fcd34d' : '#bfdbfe'}; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: ${daysRemaining !== null && daysRemaining < 0 ? '#991b1b' : daysRemaining !== null && daysRemaining <= 7 ? '#92400e' : '#1e40af'}; font-size: 14px;">
                  📅 <strong>${dueDateText}</strong>
                  ${daysRemaining !== null && daysRemaining >= 0 ? `<br>⏰ Il vous reste ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} pour terminer ce plan.` : ''}
                  ${daysRemaining !== null && daysRemaining < 0 ? `<br>⚠️ Ce plan est en retard de ${Math.abs(daysRemaining)} jour${Math.abs(daysRemaining) > 1 ? 's' : ''}.` : ''}
                </p>
              </div>
              ` : ''}

              <!-- Remaining Trainings -->
              ${data.formations.filter(f => f.status !== 'completed').length > 0 ? `
              <div style="margin: 24px 0;">
                <p style="margin: 0 0 12px; color: #374151; font-size: 14px; font-weight: 600;">
                  Formations restantes à compléter :
                </p>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #6b7280; font-size: 14px; line-height: 24px;">
                  ${data.formations.filter(f => f.status !== 'completed').map(f => `
                    <li style="margin: 4px 0;">
                      ${f.status === 'in_progress' ? '🔄' : '⭕'} ${f.name}
                      ${f.status === 'in_progress' ? '<span style="color: #f59e0b; font-size: 12px;"> (en cours)</span>' : ''}
                    </li>
                  `).join('')}
                </ul>
              </div>
              ` : ''}

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Continuer ma formation
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">
                Vous recevez cet email car un administrateur vous a envoyé un rappel concernant votre plan de formation.
              </p>
              <p style="margin: 16px 0 0; color: #d1d5db; font-size: 12px;">
                © ${new Date().getFullYear()} WiseTwin. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  return info;
}

// Interface pour les données de rappel groupé
export interface BulkTrainingReminderData {
  email: string;
  memberName: string;
  organizationName: string;
  plans: Array<{
    color?: string;
    dueDate?: Date | null;
    completedCount: number;
    totalCount: number;
    formations: Array<{
      name: string;
      status: "completed" | "in_progress" | "not_started";
    }>;
  }>;
}

// Fonction pour envoyer un rappel de formation groupé (plusieurs plans)
export async function sendBulkTrainingReminderEmail(data: BulkTrainingReminderData) {
  const baseUrl = getBaseUrl();
  const dashboardUrl = `${baseUrl}/organisation/plan-de-formation`;

  // Calculer les statistiques globales
  const totalPlans = data.plans.length;
  const completedPlans = data.plans.filter(p => p.completedCount === p.totalCount).length;
  const overduePlans = data.plans.filter(p =>
    p.dueDate && new Date(p.dueDate) < new Date() && p.completedCount < p.totalCount
  ).length;

  const info = await transporter.sendMail({
    from: '"WiseTwin" <no-reply@wisetwin.eu>',
    replyTo: "support@wisetwin.eu",
    to: data.email,
    subject: `Rappel : ${totalPlans} plan${totalPlans > 1 ? 's' : ''} de formation en cours - ${data.organizationName}`,
    headers: {
      "X-Mailer": "WiseTwin",
      "X-Priority": "3",
    },
    text: `
Bonjour ${data.memberName},

Vous avez ${totalPlans} plan${totalPlans > 1 ? 's' : ''} de formation en cours dans l'organisation ${data.organizationName}.

Résumé :
- Plans terminés : ${completedPlans}/${totalPlans}
${overduePlans > 0 ? `- Plans en retard : ${overduePlans}` : ''}

Détail de vos formations :
${data.plans.map((plan, index) => {
  const percentage = plan.totalCount > 0 ? Math.round((plan.completedCount / plan.totalCount) * 100) : 0;
  const dueDateText = plan.dueDate ? ` (échéance : ${new Date(plan.dueDate).toLocaleDateString('fr-FR')})` : '';
  return `\nGroupe ${index + 1}${dueDateText}
  Progression : ${plan.completedCount}/${plan.totalCount} formations (${percentage}%)`;
}).join('\n')}

Connectez-vous pour continuer vos formations :
${dashboardUrl}

L'équipe WiseTwin
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; text-align: center; line-height: 80px; font-size: 36px; color: white; font-weight: bold; margin-bottom: 16px;">
                📚
              </div>
              <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700;">
                Rappel : Vos plans de formation
              </h1>
              <p style="margin: 8px 0 0; color: #6b7280; font-size: 16px;">
                ${data.organizationName}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 24px;">
                Bonjour ${data.memberName},
              </p>
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 24px;">
                Vous avez <strong>${totalPlans} plan${totalPlans > 1 ? 's' : ''} de formation</strong> en cours dans l'organisation <strong>${data.organizationName}</strong>.
              </p>

              <!-- Summary Stats -->
              <div style="margin: 24px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                <p style="margin: 0 0 12px; color: #374151; font-size: 14px; font-weight: 600;">
                  Résumé global :
                </p>
                <div style="display: flex; justify-content: space-around; text-align: center;">
                  <div>
                    <p style="margin: 0; color: #10b981; font-size: 24px; font-weight: bold;">${completedPlans}</p>
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">Terminés</p>
                  </div>
                  <div>
                    <p style="margin: 0; color: #f59e0b; font-size: 24px; font-weight: bold;">${totalPlans - completedPlans - overduePlans}</p>
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">En cours</p>
                  </div>
                  ${overduePlans > 0 ? `
                  <div>
                    <p style="margin: 0; color: #ef4444; font-size: 24px; font-weight: bold;">${overduePlans}</p>
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">En retard</p>
                  </div>
                  ` : ''}
                </div>
              </div>

              <!-- Plans Details -->
              <div style="margin: 24px 0;">
                <p style="margin: 0 0 16px; color: #374151; font-size: 14px; font-weight: 600;">
                  Détail de vos formations :
                </p>

                ${data.plans.map((plan, index) => {
                  const percentage = plan.totalCount > 0 ? Math.round((plan.completedCount / plan.totalCount) * 100) : 0;
                  const isOverdue = plan.dueDate && new Date(plan.dueDate) < new Date() && plan.completedCount < plan.totalCount;
                  const isCompleted = plan.completedCount === plan.totalCount;

                  return `
                  <div style="margin-bottom: 16px; padding: 16px; border-left: 4px solid ${plan.color || '#667eea'}; background-color: #fafafa; border-radius: 0 8px 8px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <h3 style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">
                        Groupe de formations ${index + 1}
                      </h3>
                      ${isCompleted ? '<span style="background-color: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">✓ Terminé</span>' : ''}
                      ${isOverdue ? '<span style="background-color: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">En retard</span>' : ''}
                    </div>

                    ${plan.dueDate ? `
                    <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">
                      📅 Échéance : ${new Date(plan.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    ` : ''}

                    <div style="margin-top: 8px;">
                      <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background-color: ${isCompleted ? '#10b981' : isOverdue ? '#ef4444' : '#667eea'};"></div>
                      </div>
                      <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">
                        ${plan.completedCount}/${plan.totalCount} formations (${percentage}%)
                      </p>
                    </div>
                  </div>
                  `;
                }).join('')}
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Voir mes formations
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">
                Vous recevez cet email car un administrateur vous a envoyé un rappel concernant vos plans de formation.
              </p>
              <p style="margin: 16px 0 0; color: #d1d5db; font-size: 12px;">
                © ${new Date().getFullYear()} WiseTwin. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  return info;
}