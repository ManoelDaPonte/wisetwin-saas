// Récupère la liste des emails autorisés depuis les variables d'environnement
// Format: SUPER_ADMIN_EMAILS="email1@example.com,email2@example.com"
function getSuperAdminEmails(): string[] {
  // Utilise NEXT_PUBLIC pour côté client, sinon process.env pour côté serveur
  const emails = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS || process.env.SUPER_ADMIN_EMAILS || '';
  console.log('[SUPER_ADMIN] Raw SUPER_ADMIN_EMAILS:', emails);

  const emailList = emails.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
  console.log('[SUPER_ADMIN] Parsed email list:', emailList);

  return emailList;
}

export function isSuperAdmin(email: string): boolean {
  const authorizedEmails = getSuperAdminEmails();
  const normalizedEmail = email.toLowerCase();

  console.log('[SUPER_ADMIN] Checking email:', normalizedEmail);
  console.log('[SUPER_ADMIN] Authorized emails:', authorizedEmails);
  console.log('[SUPER_ADMIN] Is authorized:', authorizedEmails.includes(normalizedEmail));

  // Vérifie si l'email est dans la liste des emails autorisés
  return authorizedEmails.includes(normalizedEmail);
}

export function canAccessAdminPanel(userEmail: string): boolean {
  return isSuperAdmin(userEmail);
}