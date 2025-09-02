"use client";

import { useCurrentLanguage } from "@/stores/language-store";
import { useTranslation } from "@/translations";

/**
 * Hook simplifié pour utiliser les traductions
 * Récupère automatiquement la langue courante depuis le store
 */
export function useTranslations() {
  const currentLanguage = useCurrentLanguage();
  const { t } = useTranslation(currentLanguage);
  
  return t;
}