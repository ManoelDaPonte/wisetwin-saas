import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContainer } from "./use-container";
import { 
  BuildType, 
  CompletedFormation,
  CompletedFormationsResponse,
  CompletedFormationsOptions,
  MarkCompletedParams
} from "@/types";

// Fonction pour récupérer les formations terminées
async function fetchCompletedFormations(
  containerId: string,
  options: CompletedFormationsOptions = {}
): Promise<CompletedFormationsResponse> {
  const params = new URLSearchParams({ containerId });

  if (options.buildType) {
    params.append("buildType", options.buildType);
  }

  const response = await fetch(`/api/formations/completed?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Impossible de récupérer les formations terminées");
  }

  return response.json();
}

// Fonction pour marquer une formation comme terminée
async function markFormationCompleted(params: MarkCompletedParams) {
  const response = await fetch("/api/formations/completed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Impossible de marquer la formation comme terminée");
  }

  return response.json();
}

// Hook principal pour gérer les formations terminées
export function useCompletedFormations(options: CompletedFormationsOptions = {}) {
  const { containerId, isReady } = useContainer();
  const queryClient = useQueryClient();

  // Query pour récupérer les formations terminées
  const query = useQuery({
    queryKey: ["completedFormations", containerId, options],
    queryFn: () => fetchCompletedFormations(containerId!, options),
    enabled: isReady && !!containerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation pour marquer une formation comme terminée
  const markCompletedMutation = useMutation({
    mutationFn: (params: Omit<MarkCompletedParams, 'containerId'>) =>
      markFormationCompleted({ ...params, containerId: containerId! }),
    onSuccess: () => {
      // Invalider les queries des formations terminées
      queryClient.invalidateQueries({
        queryKey: ["completedFormations", containerId],
      });
      // Invalider aussi les builds normaux qui pourraient avoir changé de statut
      queryClient.invalidateQueries({
        queryKey: ["builds", containerId],
      });
    },
  });

  return {
    ...query,
    completedFormations: query.data?.completions || [],
    totalCompleted: query.data?.total || 0,
    markAsCompleted: markCompletedMutation.mutate,
    isMarkingCompleted: markCompletedMutation.isPending,
    markCompletedError: markCompletedMutation.error,
  };
}

// Hook spécialisé pour récupérer les formations terminées avec les détails des builds
export function useCompletedFormationsWithDetails(buildType: BuildType) {
  const { containerId, isReady } = useContainer();
  const { completedFormations, ...restQuery } = useCompletedFormations({ buildType });

  // Query pour récupérer les détails des builds via l'API (pas directement Azure)
  const buildsDetailsQuery = useQuery({
    queryKey: ["completedFormationsDetails", containerId, buildType, completedFormations.map(f => f.buildName)],
    queryFn: async () => {
      if (!containerId || completedFormations.length === 0) {
        return { builds: [] };
      }

      // Récupérer tous les builds via l'API /api/builds
      const params = new URLSearchParams({
        containerId,
        type: buildType,
      });

      const response = await fetch(`/api/builds?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Impossible de récupérer les builds');
      }

      const allBuildsData = await response.json();
      const allBuilds = allBuildsData.builds || [];
      
      // Filtrer seulement ceux qui sont terminés
      const completedBuildNames = new Set(completedFormations.map(f => f.buildName));
      const completedBuildsWithDetails = allBuilds.filter((build: any) => 
        completedBuildNames.has(build.name) || completedBuildNames.has(build.id || "")
      );

      // Ajouter les informations de completion
      const buildsWithCompletionInfo = completedBuildsWithDetails.map((build: any) => {
        const completion = completedFormations.find(f => 
          f.buildName === build.name || f.buildName === (build.id || "")
        );
        return {
          ...build,
          completion: completion ? {
            completedAt: completion.completedAt,
            progress: completion.progress,
            startedAt: completion.startedAt,
          } : null
        };
      });

      return { builds: buildsWithCompletionInfo };
    },
    enabled: isReady && !!containerId && completedFormations.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    ...restQuery,
    data: buildsDetailsQuery.data,
    isLoading: restQuery.isLoading || buildsDetailsQuery.isLoading,
    error: restQuery.error || buildsDetailsQuery.error,
    completedFormations,
    totalCompleted: restQuery.totalCompleted,
  };
}