import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FormationMetadata } from "@/lib/admin/metadata";
import { BuildType } from "@/lib/azure";

interface MetadataParams {
  containerId: string;
  buildType: BuildType;
  buildName: string;
}

interface MetadataResponse {
  exists: boolean;
  metadata?: FormationMetadata;
  error?: string;
}

// Fetch metadata
async function fetchMetadata({ containerId, buildType, buildName }: MetadataParams): Promise<MetadataResponse> {
  const params = new URLSearchParams({
    containerId,
    buildType,
    buildName,
  });

  const response = await fetch(`/api/builds/metadata?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des métadonnées");
  }

  return response.json();
}

// Save metadata
async function saveMetadata({ containerId, buildType, buildName }: MetadataParams, metadata: FormationMetadata) {
  const response = await fetch("/api/builds/metadata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      containerId,
      buildType,
      buildName,
      metadata,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la sauvegarde des métadonnées");
  }

  return response.json();
}

// Create default metadata
async function createDefaultMetadata({ containerId, buildType, buildName }: MetadataParams) {
  const response = await fetch("/api/builds/metadata", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      containerId,
      buildType,
      buildName,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la création des métadonnées par défaut");
  }

  return response.json();
}

// Delete metadata
async function deleteMetadata({ containerId, buildType, buildName }: MetadataParams) {
  const params = new URLSearchParams({
    containerId,
    buildType,
    buildName,
  });

  const response = await fetch(`/api/builds/metadata?${params.toString()}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression des métadonnées");
  }

  return response.json();
}

export function useFormationMetadata(params: MetadataParams) {
  const queryClient = useQueryClient();
  const queryKey = ["formation-metadata", params.containerId, params.buildType, params.buildName];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchMetadata(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const saveMutation = useMutation({
    mutationFn: (metadata: FormationMetadata) => saveMetadata(params, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      // Invalider aussi la liste des formations pour mettre à jour le statut "hasMetadata"
      queryClient.invalidateQueries({ queryKey: ["admin-formations"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: () => createDefaultMetadata(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["admin-formations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMetadata(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["admin-formations"] });
    },
  });

  return {
    // Query data
    ...query,
    
    // Mutations
    saveMetadata: saveMutation.mutate,
    createDefaultMetadata: createMutation.mutate,
    deleteMetadata: deleteMutation.mutate,
    
    // Loading states
    isSaving: saveMutation.isPending,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Errors
    saveError: saveMutation.error,
    createError: createMutation.error,
    deleteError: deleteMutation.error,
    
    // Success states
    saveSuccess: saveMutation.isSuccess,
    createSuccess: createMutation.isSuccess,
    deleteSuccess: deleteMutation.isSuccess,
  };
}