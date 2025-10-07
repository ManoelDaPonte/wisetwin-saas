import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/stores/organization-store";
import { 
  TrainingTag, 
  TrainingTagsResponse
} from "@/types/training";
import { CreateTrainingTagInputData, UpdateTrainingTagInputData } from "@/validators/training";

// ===== FONCTIONS API =====

async function fetchTrainingTags(
  organizationId: string, 
  options: {
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<TrainingTagsResponse> {
  const searchParams = new URLSearchParams({
    organizationId,
    ...(options.search && { search: options.search }),
    ...(options.limit && { limit: options.limit.toString() }),
    ...(options.offset && { offset: options.offset.toString() }),
  });

  const response = await fetch(`/api/training-management/tags?${searchParams}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des tags");
  }

  return response.json();
}

async function fetchTrainingTag(tagId: string, organizationId: string): Promise<TrainingTag> {
  const response = await fetch(
    `/api/training-management/tags/${tagId}?organizationId=${organizationId}`
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération du tag");
  }

  return response.json();
}

async function createTrainingTag(
  organizationId: string, 
  data: CreateTrainingTagInputData
): Promise<TrainingTag> {
  const response = await fetch(`/api/training-management/tags?organizationId=${organizationId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la création du tag");
  }

  return response.json();
}

async function updateTrainingTag(
  tagId: string,
  organizationId: string,
  data: UpdateTrainingTagInputData
): Promise<TrainingTag> {
  const response = await fetch(
    `/api/training-management/tags/${tagId}?organizationId=${organizationId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la mise à jour du tag");
  }

  return response.json();
}

async function deleteTrainingTag(tagId: string, organizationId: string): Promise<void> {
  const response = await fetch(
    `/api/training-management/tags/${tagId}?organizationId=${organizationId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression du tag");
  }
}

// ===== HOOKS =====

export function useTrainingTags(options: {
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["training-tags", activeOrganization?.id, options],
    queryFn: () => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return fetchTrainingTags(activeOrganization.id, options);
    },
    enabled: !!activeOrganization?.id,
    staleTime: 1 * 60 * 1000, // 1 minute (réduit pour plus de réactivité)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true, // Refetch quand le composant est monté
  });
}

export function useTrainingTag(tagId: string) {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["training-tag", tagId, activeOrganization?.id],
    queryFn: () => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return fetchTrainingTag(tagId, activeOrganization.id);
    },
    enabled: !!tagId && !!activeOrganization?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateTrainingTag() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (data: CreateTrainingTagInputData) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return createTrainingTag(activeOrganization.id, data);
    },
    onSuccess: () => {
      // Invalider et refetch la liste des tags
      queryClient.invalidateQueries({
        queryKey: ["training-tags", activeOrganization?.id],
      });
    },
  });
}

export function useUpdateTrainingTag() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: ({ tagId, data }: { tagId: string; data: UpdateTrainingTagInputData }) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return updateTrainingTag(tagId, activeOrganization.id, data);
    },
    onSuccess: (updatedTag) => {
      // Mettre à jour le cache du tag spécifique
      queryClient.setQueryData(
        ["training-tag", updatedTag.id, activeOrganization?.id],
        updatedTag
      );
      
      // Invalider la liste des tags
      queryClient.invalidateQueries({
        queryKey: ["training-tags", activeOrganization?.id],
      });
    },
  });
}

export function useDeleteTrainingTag() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (tagId: string) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return deleteTrainingTag(tagId, activeOrganization.id);
    },
    onSuccess: (_, deletedTagId) => {
      // Supprimer le tag du cache
      queryClient.removeQueries({
        queryKey: ["training-tag", deletedTagId, activeOrganization?.id],
      });
      
      // Invalider la liste des tags
      queryClient.invalidateQueries({
        queryKey: ["training-tags", activeOrganization?.id],
      });
    },
  });
}

// ===== HOOK DE GESTION COMPLÈTE =====

export function useTrainingTagsManager() {
  const { activeOrganization } = useOrganizationStore();
  
  const tagsQuery = useTrainingTags();
  const createMutation = useCreateTrainingTag();
  const updateMutation = useUpdateTrainingTag();
  const deleteMutation = useDeleteTrainingTag();

  const canManage = activeOrganization?.role === "OWNER" || activeOrganization?.role === "ADMIN";
  const canDelete = activeOrganization?.role === "OWNER" || activeOrganization?.role === "ADMIN";

  return {
    // Données
    tags: tagsQuery.data?.tags || [],
    total: tagsQuery.data?.total || 0,
    
    // États de chargement
    isLoading: tagsQuery.isLoading,
    isError: tagsQuery.isError,
    error: tagsQuery.error,
    
    // Actions
    createTag: createMutation.mutate,
    updateTag: updateMutation.mutate,
    deleteTag: deleteMutation.mutate,
    
    // États des mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Erreurs des mutations
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    
    // Permissions
    canManage,
    canDelete,
    
    // Utilitaires
    refetch: tagsQuery.refetch,
  };
}