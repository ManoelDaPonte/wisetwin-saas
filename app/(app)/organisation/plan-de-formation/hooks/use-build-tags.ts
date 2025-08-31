import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/stores/organization-store";
import { useBuilds } from "@/app/hooks/use-builds";
import { useContainer } from "@/app/hooks/use-container";
import { useTrainingTags } from "./use-training-tags";
import { 
  BuildTag,
  BuildTagsResponse,
  CreateBuildTagData,
  BulkAssignBuildTagsData,
  BulkRemoveBuildTagsData,
  BuildWithTags,
  TrainingTag
} from "@/types/training";
import { Build, BuildType } from "@/types";
import { toast } from "sonner";

// ===== FONCTIONS API =====

async function fetchBuildTags(
  organizationId: string,
  options: {
    tagId?: string;
    buildType?: BuildType;
    containerId?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<BuildTagsResponse> {
  const searchParams = new URLSearchParams({
    organizationId,
    ...(options.tagId && { tagId: options.tagId }),
    ...(options.buildType && { buildType: options.buildType }),
    ...(options.containerId && { containerId: options.containerId }),
    ...(options.priority && { priority: options.priority }),
    ...(options.limit && { limit: options.limit.toString() }),
    ...(options.offset && { offset: options.offset.toString() }),
  });

  const response = await fetch(`/api/training-management/build-tags?${searchParams}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des build-tags");
  }

  return response.json();
}

async function fetchBuildTag(
  buildTagId: string,
  organizationId: string
): Promise<BuildTag> {
  const response = await fetch(
    `/api/training-management/build-tags/${buildTagId}?organizationId=${organizationId}`
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération du build-tag");
  }

  return response.json();
}

async function createBuildTag(
  organizationId: string,
  data: CreateBuildTagData
): Promise<BuildTag> {
  const response = await fetch(
    `/api/training-management/build-tags?organizationId=${organizationId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la création du build-tag");
  }

  return response.json();
}

async function bulkAssignBuildTags(
  organizationId: string,
  data: BulkAssignBuildTagsData
): Promise<{ message: string; buildTags: BuildTag[]; createdCount: number }> {
  const response = await fetch(
    `/api/training-management/build-tags?organizationId=${organizationId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'assignment des tags aux builds");
  }

  return response.json();
}

async function bulkRemoveBuildTags(
  organizationId: string,
  data: BulkRemoveBuildTagsData
): Promise<{ message: string; deletedCount: number }> {
  const response = await fetch(
    `/api/training-management/build-tags?organizationId=${organizationId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression des tags des builds");
  }

  return response.json();
}


async function deleteBuildTag(
  buildTagId: string,
  organizationId: string
): Promise<{ message: string }> {
  const response = await fetch(
    `/api/training-management/build-tags/${buildTagId}?organizationId=${organizationId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression du build-tag");
  }

  return response.json();
}

// ===== HOOKS DE BASE =====

export function useBuildTags(options: {
  tagId?: string;
  buildType?: BuildType;
  containerId?: string;
  priority?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["build-tags", activeOrganization?.id, options],
    queryFn: () => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return fetchBuildTags(activeOrganization.id, options);
    },
    enabled: !!activeOrganization?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

export function useBuildTag(buildTagId: string) {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["build-tag", buildTagId, activeOrganization?.id],
    queryFn: () => {
      if (!activeOrganization?.id || !buildTagId) {
        throw new Error("Paramètres manquants");
      }
      return fetchBuildTag(buildTagId, activeOrganization.id);
    },
    enabled: !!activeOrganization?.id && !!buildTagId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateBuildTag() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (data: CreateBuildTagData) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return createBuildTag(activeOrganization.id, data);
    },
    onSuccess: () => {
      toast.success("Tag assigné au build avec succès");
      
      // Invalider les caches pertinents
      queryClient.invalidateQueries({
        queryKey: ["build-tags", activeOrganization?.id],
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

export function useBulkAssignBuildTags() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (data: BulkAssignBuildTagsData) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return bulkAssignBuildTags(activeOrganization.id, data);
    },
    onSuccess: (result) => {
      toast.success(`${result.createdCount} assignments créés avec succès`);
      
      queryClient.invalidateQueries({
        queryKey: ["build-tags", activeOrganization?.id],
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

export function useBulkRemoveBuildTags() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (data: BulkRemoveBuildTagsData) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return bulkRemoveBuildTags(activeOrganization.id, data);
    },
    onSuccess: (result) => {
      toast.success(`${result.deletedCount} assignments supprimés`);
      
      queryClient.invalidateQueries({
        queryKey: ["build-tags", activeOrganization?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}


export function useDeleteBuildTag() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (buildTagId: string) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return deleteBuildTag(buildTagId, activeOrganization.id);
    },
    onSuccess: (_, buildTagId) => {
      toast.success("Build-tag supprimé avec succès");
      
      queryClient.invalidateQueries({
        queryKey: ["build-tags", activeOrganization?.id],
      });
      queryClient.removeQueries({
        queryKey: ["build-tag", buildTagId, activeOrganization?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ===== HOOK COMPOSITE INTELLIGENT =====

export function useBuildsWithTags(buildType?: BuildType) {
  const { activeOrganization } = useOrganizationStore();
  const { containerId } = useContainer();
  
  // Pour les plans de formation, on ne s'intéresse qu'aux WiseTrainer
  const wisetrainerBuilds = useBuilds("wisetrainer");
  
  // Récupérer tous les build-tags
  const { data: buildTagsResponse } = useBuildTags();
  const { data: tagsResponse } = useTrainingTags();

  return useQuery({
    queryKey: ["builds-with-tags", activeOrganization?.id, containerId, buildType],
    queryFn: (): BuildWithTags[] => {
      
      // Seules les formations WiseTrainer sont concernées par les plans de formation
      const allBuilds: Build[] = wisetrainerBuilds.data?.builds || [];

      const buildTags = buildTagsResponse?.buildTags || [];
      const tags = tagsResponse?.tags || [];

      // Créer le mapping des builds avec leurs tags
      return allBuilds.map(build => {
        // Convertir buildType pour la comparaison avec buildTags 
        const buildTypeForComparison = (build.buildType || "WISETRAINER").toUpperCase() as "WISETOUR" | "WISETRAINER";
        
        // Trouver tous les build-tags pour ce build
        const relatedBuildTags = buildTags.filter(bt => 
          bt.buildName === build.name &&
          bt.buildType === buildTypeForComparison &&
          bt.containerId === containerId
        );

        // Récupérer les tags associés
        const buildTagsData = relatedBuildTags.map(bt => {
          const tag = tags.find(t => t.id === bt.tagId);
          return tag;
        }).filter((tag): tag is TrainingTag => Boolean(tag));

        // Calculer les statistiques de progression
        const totalMembers = buildTagsData.reduce((sum, tag) => 
          sum + (tag._count?.memberTags || 0), 0
        );
        const completedCount = relatedBuildTags.reduce((sum, bt) => 
          sum + (bt._count?.completions || 0), 0
        );
        const completionRate = totalMembers > 0 ? (completedCount / totalMembers) * 100 : 0;

        return {
          ...build, // Inclure toutes les propriétés du build original (metadata, imageUrl, etc.)
          name: build.name,
          type: buildTypeForComparison,
          containerId: containerId!,
          updatedAt: build.lastModified ? new Date(build.lastModified) : undefined,
          size: build.totalSize,
          tags: buildTagsData,
          stats: {
            totalMembers,
            completedCount,
            pendingCount: totalMembers - completedCount,
            completionRate: Math.round(completionRate * 100) / 100,
          },
        };
      });
    },
    enabled: !!activeOrganization?.id &&
      !!containerId &&
      wisetrainerBuilds.isSuccess,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

// Utilitaire pour créer l'ID composite d'un build
export function createBuildId(buildName: string, buildType: BuildType, containerId: string): string {
  return `${buildName}|${buildType}|${containerId}`;
}

// Utilitaire pour déconstruire l'ID composite d'un build
export function parseBuildId(buildId: string): { buildName: string; buildType: BuildType; containerId: string } | null {
  const parts = buildId.split("|");
  if (parts.length !== 3) return null;
  
  const [buildName, buildType, containerId] = parts;
  if (buildType !== "WISETOUR" && buildType !== "WISETRAINER") return null;
  
  return { buildName, buildType: buildType as BuildType, containerId };
}