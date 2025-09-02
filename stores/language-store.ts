import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'fr' | 'en'

interface LanguageStore {
  // État
  currentLanguage: Language
  
  // Actions
  setLanguage: (language: Language) => void
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      // État initial (français par défaut)
      currentLanguage: 'fr',
      
      // Actions
      setLanguage: (language) => set({ 
        currentLanguage: language 
      }),
    }),
    {
      name: 'language-storage', // Clé localStorage
    }
  )
)

// Selector pour la réactivité
export const useCurrentLanguage = () => useLanguageStore((state) => state.currentLanguage)