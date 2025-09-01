import type { User } from "next-auth";

/**
 * Retourne le nom d'affichage de l'utilisateur (firstName + name ou name seul)
 */
export function getDisplayName(user: Partial<User>): string {
  if (user.firstName && user.name) {
    return `${user.firstName} ${user.name}`;
  }
  return user.name || user.email || "Utilisateur";
}

/**
 * Retourne les initiales de l'utilisateur pour l'avatar
 */
export function getUserInitials(user: Partial<User>): string {
  if (user.firstName && user.name) {
    return `${user.firstName.charAt(0)}${user.name.charAt(0)}`.toUpperCase();
  }
  if (user.name) {
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
  }
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  return "U";
}