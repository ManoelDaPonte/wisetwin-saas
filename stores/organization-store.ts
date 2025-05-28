import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Organization = {
  id: string
  name: string
  description: string | null
  role: "OWNER" | "ADMIN" | "MEMBER"
  azureContainerId?: string
}

interface OrganizationStore {
  // État
  activeOrganization: Organization | null
  organizations: Organization[]
  
  // Actions
  setOrganizations: (organizations: Organization[]) => void
  switchToOrganization: (organization: Organization) => void
  switchToPersonal: () => void
  addOrganization: (organization: Organization) => void
  updateOrganization: (id: string, updates: Partial<Organization>) => void
}

// Selectors séparés pour la réactivité
export const useIsPersonalSpace = () => useOrganizationStore((state) => state.activeOrganization === null)
export const useCurrentContainerId = () => useOrganizationStore((state) => state.activeOrganization?.azureContainerId || null)

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      // État initial
      activeOrganization: null,
      organizations: [],
      
      // Actions
      setOrganizations: (organizations) => set({ organizations }),
      
      switchToOrganization: (organization) => set({ 
        activeOrganization: organization 
      }),
      
      switchToPersonal: () => set({ 
        activeOrganization: null 
      }),
      
      addOrganization: (organization) => set((state) => ({
        organizations: [...state.organizations, organization],
        activeOrganization: organization // Switch automatiquement à la nouvelle org
      })),
      
      updateOrganization: (id, updates) => set((state) => ({
        organizations: state.organizations.map(org => 
          org.id === id ? { ...org, ...updates } : org
        ),
        activeOrganization: state.activeOrganization?.id === id
          ? { ...state.activeOrganization, ...updates }
          : state.activeOrganization
      }))
    }),
    {
      name: 'organization-storage', // Clé localStorage
      partialize: (state) => ({ 
        activeOrganization: state.activeOrganization 
      }) // On persiste seulement l'organisation active
    }
  )
)