import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useOrganizationStore } from '@/stores/organization-store'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useOrganizations } from '@/app/hooks/use-organizations'

interface UpdateOrganizationData {
  name: string
  description?: string
}

interface TransferOwnershipData {
  newOwnerId: string
}

export function useOrganizationSettings() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { activeOrganization, updateOrganization: updateOrgInStore, switchToOrganization } = useOrganizationStore()
  const { fetchOrganizations } = useOrganizations()

  // Mutation pour mettre à jour l'organisation
  const updateOrganization = useMutation({
    mutationFn: async (data: UpdateOrganizationData) => {
      if (!activeOrganization) {
        throw new Error('Aucune organisation active')
      }
      
      const response = await fetch(`/api/organization?organizationId=${activeOrganization.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la mise à jour')
      }

      return response.json()
    },
    onSuccess: (updatedOrg) => {
      // Mettre à jour le store local
      if (activeOrganization?.id === updatedOrg.id) {
        updateOrgInStore(updatedOrg.id, {
          name: updatedOrg.name,
          description: updatedOrg.description
        })
      }
      
      // Invalider les queries liées aux organisations
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['organization', updatedOrg.id] })
      
      toast.success('Organisation mise à jour avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Mutation pour supprimer l'organisation
  const deleteOrganization = useMutation({
    mutationFn: async () => {
      if (!activeOrganization) {
        throw new Error('Aucune organisation active')
      }
      
      const response = await fetch(`/api/organization?organizationId=${activeOrganization.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la suppression')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalider les queries et rediriger
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organisation supprimée avec succès')
      router.push('/accueil')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Mutation pour transférer la propriété
  const transferOwnership = useMutation({
    mutationFn: async (data: TransferOwnershipData) => {
      if (!activeOrganization) {
        throw new Error('Aucune organisation active')
      }
      
      const response = await fetch(`/api/organization/transfer?organizationId=${activeOrganization.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors du transfert')
      }

      return response.json()
    },
    onSuccess: async (updatedOrg) => {
      // Invalider les queries pour forcer un rechargement
      await queryClient.invalidateQueries({ queryKey: ['organizations'] })
      await queryClient.invalidateQueries({ queryKey: ['organization', updatedOrg.id] })
      await queryClient.invalidateQueries({ queryKey: ['members', updatedOrg.id] })
      
      // Recharger la liste des organisations pour mettre à jour les rôles
      const organizations = await fetchOrganizations()
      
      // Trouver l'organisation mise à jour avec le nouveau rôle
      const updatedOrgWithRole = organizations.find((org: any) => org.id === updatedOrg.id)
      
      if (updatedOrgWithRole && activeOrganization?.id === updatedOrg.id) {
        // Mettre à jour l'organisation active avec le nouveau rôle
        switchToOrganization(updatedOrgWithRole)
      }
      
      toast.success('Propriété transférée avec succès')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return {
    updateOrganization: updateOrganization.mutate,
    deleteOrganization: deleteOrganization.mutate,
    transferOwnership: transferOwnership.mutate,
    isUpdating: updateOrganization.isPending,
    isDeleting: deleteOrganization.isPending,
    isTransferring: transferOwnership.isPending,
  }
}