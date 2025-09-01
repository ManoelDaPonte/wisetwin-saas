// import type { User } from "next-auth";

// Type générique pour tout utilisateur (session ou membre)
interface UserLike {
  firstName?: string | null;
  name?: string | null;
  email?: string;
}

/**
 * Retourne le nom d'affichage de l'utilisateur (firstName + name ou name seul)
 * Compatible avec User de NextAuth et Member des API
 */
export function getDisplayName(user: Partial<UserLike>): string {
  if (user.firstName && user.name) {
    return `${user.firstName} ${user.name}`;
  }
  return user.name || user.email || "Utilisateur";
}

/**
 * Retourne les initiales de l'utilisateur pour l'avatar
 * Compatible avec User de NextAuth et Member des API
 */
export function getUserInitials(user: Partial<UserLike>): string {
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

// Fonctions spécifiques pour rétrocompatibilité avec les types NextAuth
export { getDisplayName as getDisplayName, getUserInitials as getUserInitials };