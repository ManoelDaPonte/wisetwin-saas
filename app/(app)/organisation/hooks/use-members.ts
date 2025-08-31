"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useOrganizationStore } from "@/stores/organization-store"
import { toast } from "sonner"
import { Member, Invitation, MembersResponse } from "@/types"

export type { Member, Invitation }

export function useMembers() {
  const { activeOrganization } = useOrganizationStore()
  const queryClient = useQueryClient()

  // Query pour récupérer les membres et invitations
  const {
    data,
    isLoading,
    error,
    refetch: fetchMembers,
  } = useQuery<MembersResponse>({
    queryKey: ["members", activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization) {
        throw new Error("Aucune organisation sélectionnée")
      }

      const response = await fetch(
        `/api/members?organizationId=${activeOrganization.id}`
      )

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des membres")
      }

      return response.json()
    },
    enabled: !!activeOrganization,
  })

  // Mutation pour inviter un membre
  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: "ADMIN" | "MEMBER" }) => {
      if (!activeOrganization) {
        throw new Error("Aucune organisation sélectionnée")
      }

      const response = await fetch(
        `/api/members?organizationId=${activeOrganization.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de l'invitation")
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success("Invitation envoyée avec succès")
      queryClient.invalidateQueries({ queryKey: ["members", activeOrganization?.id] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Mutation pour mettre à jour le rôle d'un membre
  const updateRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string
      role: "ADMIN" | "MEMBER"
    }) => {
      if (!activeOrganization) {
        throw new Error("Aucune organisation sélectionnée")
      }

      const response = await fetch(
        `/api/members/${memberId}?organizationId=${activeOrganization.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la mise à jour")
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success("Rôle mis à jour avec succès")
      queryClient.invalidateQueries({ queryKey: ["members", activeOrganization?.id] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Mutation pour retirer un membre
  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      if (!activeOrganization) {
        throw new Error("Aucune organisation sélectionnée")
      }

      const response = await fetch(
        `/api/members/${memberId}?organizationId=${activeOrganization.id}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success("Membre retiré avec succès")
      queryClient.invalidateQueries({ queryKey: ["members", activeOrganization?.id] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Mutation pour annuler une invitation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      if (!activeOrganization) {
        throw new Error("Aucune organisation sélectionnée")
      }

      const response = await fetch(
        `/api/invitations/${invitationId}?organizationId=${activeOrganization.id}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de l'annulation")
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success("Invitation annulée")
      queryClient.invalidateQueries({ queryKey: ["members", activeOrganization?.id] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return {
    members: data?.members || [],
    invitations: data?.invitations || [],
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Une erreur est survenue") : null,
    fetchMembers,
    inviteMember: (email: string, role: "ADMIN" | "MEMBER") =>
      inviteMutation.mutate({ email, role }),
    updateMemberRole: (memberId: string, role: "ADMIN" | "MEMBER") =>
      updateRoleMutation.mutate({ memberId, role }),
    removeMember: (memberId: string) => removeMutation.mutate(memberId),
    cancelInvitation: (invitationId: string) =>
      cancelInvitationMutation.mutate(invitationId),
    isInviting: inviteMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isRemoving: removeMutation.isPending,
    isCancelling: cancelInvitationMutation.isPending,
  }
}