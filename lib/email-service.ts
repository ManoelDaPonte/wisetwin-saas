import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import { InvitationEmailData } from "@/types/organization";

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false,
  auth: {
    user: "no-reply@wisetwin.eu",
    pass: env.EMAIL_PASSWORD,
  },
});

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


export async function sendInvitationEmail(data: InvitationEmailData) {
  const baseUrl = getBaseUrl();

  // Générer l'initiale pour le logo fallback
  const organizationInitial = data.organizationName.charAt(0).toUpperCase();

  // Formater le rôle en français
  const roleLabel = data.role === "ADMIN" ? "Administrateur" : "Membre";

  // Calculer le nombre de jours avant expiration
  const daysUntilExpiry = Math.ceil(
    (data.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const info = await transporter.sendMail({
    from: '"WiseTwin" <no-reply@wisetwin.eu>',
    replyTo: "support@wisetwin.eu", // Email de réponse
    to: data.email,
    subject: `${data.inviterName} vous invite à rejoindre ${data.organizationName} sur WiseTwin`,
    headers: {
      "X-Mailer": "WiseTwin",
      "X-Priority": "3", // Normal priority
    },
    text: `
Bonjour,

${data.inviterName} vous invite à rejoindre l'organisation ${data.organizationName} en tant que ${roleLabel}.

Rendez-vous sur ${baseUrl} et utilisez ce code : ${data.code}

Cette invitation expire dans ${daysUntilExpiry} jours.

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
                ${organizationInitial}
              </div>
              <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700;">
                Invitation à rejoindre ${data.organizationName}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 24px;">
                Bonjour,
              </p>
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 24px;">
                <strong>${
                  data.inviterName
                }</strong> vous invite à rejoindre l'organisation <strong>${
      data.organizationName
    }</strong> sur WiseTwin en tant que <strong>${roleLabel}</strong>.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${baseUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Aller sur WiseTwin
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative methods -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
                  <strong>Autres méthodes :</strong>
                </p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  • Code d'invitation : <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 16px; color: #111827;">${
                    data.code
                  }</code>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  • Rendez-vous sur : <a href="${baseUrl}" style="color: #667eea;">${baseUrl}</a>
                </p>
              </div>
              
              <!-- Expiration notice -->
              <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  ⏰ Cette invitation expire dans <strong>${daysUntilExpiry} jours</strong>.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">
                Vous recevez cet email car quelqu'un vous a invité à rejoindre une organisation sur WiseTwin.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.
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

// Fonction pour envoyer un email de bienvenue après acceptation
export async function sendWelcomeEmail(
  email: string,
  userName: string,
  organizationName: string
) {
  const baseUrl = getBaseUrl();
  const dashboardUrl = `${baseUrl}/organisation/tableau-de-bord`;

  const info = await transporter.sendMail({
    from: '"WiseTwin" <no-reply@wisetwin.eu>',
    to: email,
    subject: `Bienvenue dans ${organizationName} !`,
    text: `
Bonjour ${userName},

Bienvenue dans l'organisation ${organizationName} sur WiseTwin !

Vous pouvez maintenant accéder au tableau de bord de l'organisation :
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
            <td style="padding: 40px 40px 30px; text-align: center;">
              <div style="display: inline-block; margin-bottom: 16px;">
                🎉
              </div>
              <h1 style="margin: 0; color: #111827; font-size: 28px; font-weight: 700;">
                Bienvenue dans ${organizationName} !
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 24px;">
                Bonjour ${userName},
              </p>
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 24px;">
                Vous faites maintenant partie de l'organisation <strong>${organizationName}</strong> sur WiseTwin.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Accéder au tableau de bord
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 14px;">
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

// Fonction pour envoyer un email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  firstName?: string | null
) {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const info = await transporter.sendMail({
    from: '"WiseTwin" <no-reply@wisetwin.eu>',
    replyTo: "support@wisetwin.eu",
    to: email,
    subject: "Réinitialisation de votre mot de passe - WiseTwin",
    headers: {
      "X-Mailer": "WiseTwin",
      "X-Priority": "3",
    },
    text: `
Bonjour${firstName ? ` ${firstName}` : ""},

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte WiseTwin.

Cliquez sur le lien suivant pour réinitialiser votre mot de passe :
${resetUrl}

Ce lien est valable pendant 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

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
              <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 16px; text-align: center; line-height: 80px; font-size: 36px; color: white; font-weight: bold; margin-bottom: 16px;">
                🔐
              </div>
              <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700;">
                Réinitialisation de mot de passe
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 24px;">
                Bonjour${firstName ? ` ${firstName}` : ""},
              </p>
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 24px;">
                Vous avez demandé la réinitialisation de votre mot de passe pour votre compte WiseTwin.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Security notice -->
              <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0 0 8px; color: #92400e; font-size: 14px;">
                  ⏰ <strong>Ce lien expire dans 1 heure</strong> pour votre sécurité.
                </p>
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  🔒 Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                </p>
              </div>
              
              <!-- Alternative link -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
                  <strong>Vous ne pouvez pas cliquer sur le bouton ?</strong>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Copiez et collez ce lien dans votre navigateur : <br>
                  <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">
                Vous recevez cet email car une réinitialisation de mot de passe a été demandée pour votre compte.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                Si vous n'êtes pas à l'origine de cette demande, contactez-nous immédiatement.
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
