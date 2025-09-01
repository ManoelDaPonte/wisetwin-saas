import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/stores/organization-store";
import { useMembers } from "../../hooks/use-members"; // Réutilisation du hook existant
import { useTrainingTags } from "./use-training-tags";
import { 
  MemberTag, 
  MemberTagsResponse,
  AssignTagToMemberData,
  MemberWithTrainings 
} from "@/types/training";
import { toast } from "sonner";

// ===== FONCTIONS API =====

async function fetchMemberTags(
  organizationId: string,
  options: {
    userId?: string;
    tagId?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<MemberTagsResponse> {
  const searchParams = new URLSearchParams({
    organizationId,
    ...(options.userId && { userId: options.userId }),
    ...(options.tagId && { tagId: options.tagId }),
    ...(options.limit && { limit: options.limit.toString() }),
    ...(options.offset && { offset: options.offset.toString() }),
  });

  const response = await fetch(`/api/training-management/member-tags?${searchParams}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des assignments");
  }

  return response.json();
}

async function assignTagToMember(
  organizationId: string,
  data: AssignTagToMemberData
): Promise<MemberTag> {
  const response = await fetch(
    `/api/training-management/member-tags?organizationId=${organizationId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'assignment du tag");
  }

  return response.json();
}

async function assignTagsToMembers(
  organizationId: string,
  data: { userIds: string[]; tagIds: string[] }
): Promise<{ message: string; createdCount: number; totalPossible: number }> {
  const response = await fetch(
    `/api/training-management/member-tags?organizationId=${organizationId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'assignment des tags");
  }

  return response.json();
}

async function removeTagsFromMembers(
  organizationId: string,
  data: { userIds: string[]; tagIds: string[] }
): Promise<{ message: string; removedCount: number }> {
  const response = await fetch(
    `/api/training-management/member-tags?organizationId=${organizationId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression des tags");
  }

  return response.json();
}

async function removeMemberTag(
  memberTagId: string,
  organizationId: string
): Promise<void> {
  const response = await fetch(
    `/api/training-management/member-tags/${memberTagId}?organizationId=${organizationId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression du tag");
  }
}

// ===== HOOKS DE BASE =====

export function useMemberTags(options: {
  userId?: string;
  tagId?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["member-tags", activeOrganization?.id, options],
    queryFn: () => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return fetchMemberTags(activeOrganization.id, options);
    },
    enabled: !!activeOrganization?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAssignTagToMember() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (data: AssignTagToMemberData) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return assignTagToMember(activeOrganization.id, data);
    },
    onSuccess: () => {
      toast.success("Tag assigné avec succès");
      
      // Invalider les caches pertinents
      queryClient.invalidateQueries({
        queryKey: ["member-tags", activeOrganization?.id],
      });
      
      // Invalider aussi le cache des membres pour mettre à jour les compteurs
      queryClient.invalidateQueries({
        queryKey: ["members", activeOrganization?.id],
      });
      
      // Invalider les tags pour mettre à jour les compteurs de membres
      queryClient.invalidateQueries({
        queryKey: ["training-tags", activeOrganization?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkAssignTags() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (data: { userIds: string[]; tagIds: string[] }) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return assignTagsToMembers(activeOrganization.id, data);
    },
    onSuccess: (result) => {
      toast.success(`${result.createdCount} assignments créés avec succès`);
      
      // Invalider tous les caches pertinents
      queryClient.invalidateQueries({
        queryKey: ["member-tags", activeOrganization?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["members", activeOrganization?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["training-tags", activeOrganization?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkRemoveTags() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (data: { userIds: string[]; tagIds: string[] }) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return removeTagsFromMembers(activeOrganization.id, data);
    },
    onSuccess: (result) => {
      toast.success(`${result.removedCount} assignments supprimés avec succès`);
      
      // Invalider tous les caches pertinents
      queryClient.invalidateQueries({
        queryKey: ["member-tags", activeOrganization?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["members", activeOrganization?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["training-tags", activeOrganization?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRemoveMemberTag() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (memberTagId: string) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return removeMemberTag(memberTagId, activeOrganization.id);
    },
    onSuccess: () => {
      toast.success("Tag retiré avec succès");
      
      // Invalider les caches
      queryClient.invalidateQueries({
        queryKey: ["member-tags", activeOrganization?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["members", activeOrganization?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["training-tags", activeOrganization?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ===== HOOK COMPOSITE INTELLIGENT =====

export function useMemberTagsManager() {
  const { activeOrganization } = useOrganizationStore();
  
  // Réutilisation des hooks existants (optimisé par React Query)
  const membersQuery = useMembers(); // Hook existant réutilisé !
  const tagsQuery = useTrainingTags(); // Notre hook de tags
  const memberTagsQuery = useMemberTags(); // Nos assignments
  
  // Mutations
  const assignMutation = useAssignTagToMember();
  const bulkAssignMutation = useBulkAssignTags();
  const bulkRemoveMutation = useBulkRemoveTags();
  const removeMutation = useRemoveMemberTag();

  // Permissions
  const canManage = activeOrganization?.role === "OWNER" || activeOrganization?.role === "ADMIN";

  // Combinaison intelligente des données pour créer une vue enrichie
  const membersWithTags: MemberWithTrainings[] = (membersQuery.members || []).map(member => {
    // Récupérer les tags de ce membre
    const memberTags = (memberTagsQuery.data?.memberTags || [])
      .filter(mt => mt.userId === member.id)
      .map(mt => mt.tag!)
      .filter(Boolean);

    return {
      id: member.id,
      firstName: member.firstName,
      name: member.name,
      email: member.email,
      image: member.avatarUrl,
      tags: memberTags,
      assignments: [], // À implémenter plus tard avec les training assignments
      stats: {
        totalAssignments: memberTags.length,
        completed: 0,
        inProgress: 0,
        overdue: 0,
        completionRate: 0,
      },
    };
  });

  return {
    // Données combinées (réutilisation intelligente du cache)
    members: membersQuery.members,
    tags: tagsQuery.data?.tags || [],
    memberTags: memberTagsQuery.data?.memberTags || [],
    membersWithTags,
    
    // États de chargement (combinés)
    isLoading: membersQuery.isLoading || tagsQuery.isLoading || memberTagsQuery.isLoading,
    isError: membersQuery.error || tagsQuery.isError || memberTagsQuery.isError,
    error: membersQuery.error || tagsQuery.error?.message || (memberTagsQuery.error as Error)?.message,
    
    // Actions
    assignTag: assignMutation.mutate,
    bulkAssignTags: bulkAssignMutation.mutate,
    bulkRemoveTags: bulkRemoveMutation.mutate,
    removeTag: removeMutation.mutate,
    
    // États des mutations
    isAssigning: assignMutation.isPending,
    isBulkAssigning: bulkAssignMutation.isPending,
    isBulkRemoving: bulkRemoveMutation.isPending,
    isRemoving: removeMutation.isPending,
    
    // Permissions
    canManage,
    
    // Utilitaires
    refetch: () => {
      membersQuery.fetchMembers(); // Réutilise la fonction du hook existant
      tagsQuery.refetch();
      memberTagsQuery.refetch();
    },
    
    // Helpers pour l'interface
    getMemberTags: (memberId: string) => 
      memberTagsQuery.data?.memberTags.filter(mt => mt.userId === memberId) || [],
    getTagMembers: (tagId: string) =>
      memberTagsQuery.data?.memberTags.filter(mt => mt.tagId === tagId) || [],
  };
}