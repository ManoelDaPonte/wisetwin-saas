export function isSuperAdmin(email: string): boolean {
  return email.endsWith('@wisetwin.eu');
}

export function canAccessAdminPanel(userEmail: string): boolean {
  return isSuperAdmin(userEmail);
}