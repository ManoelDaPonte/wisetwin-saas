import { fr } from './fr';
import { en } from './en';
import { Language } from '@/stores/language-store';

export const translations = {
  fr,
  en,
} as const;

export type TranslationKey = keyof typeof fr;

// Hook pour utiliser les traductions
export const useTranslation = (language: Language) => {
  const t = translations[language];
  
  return { t };
};