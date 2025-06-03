import { useMutation } from '@tanstack/react-query'
import { useOrganizationStore } from '@/app/stores/organization-store'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function useLeaveOrganization() {
  const router = useRouter()
  const { activeOrganization } = useOrganizationStore()

  const leaveOrganization = useMutation({
    mutationFn: async () => {
      if (!activeOrganization) {
        throw new Error('Aucune organisation active')
      }

      const response = await fetch(`/api/members/me?organizationId=${activeOrganization.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la sortie')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success("Vous avez quitté l'organisation")
      router.push('/accueil')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return {
    leaveOrganization: leaveOrganization.mutate,
    isLeaving: leaveOrganization.isPending,
  }
}