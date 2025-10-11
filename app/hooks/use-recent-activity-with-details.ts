import { useQuery } from "@tanstack/react-query";
import { useUserStats } from "./use-user-stats";
import { useContainer } from "./use-container";
import { Build } from "@/types/azure";
import { useCurrentLanguage } from "@/stores/language-store";

export function useRecentActivityWithDetails() {
  const { stats, isLoading: isStatsLoading, error: statsError } = useUserStats();
  const { containerId, isReady } = useContainer();
  const currentLanguage = useCurrentLanguage();

  const recentActivity = stats?.recentActivity || [];

  // Helper pour extraire le texte localisé des métadonnées
  const getLocalizedText = (text: string | { en: string; fr: string } | undefined): string | undefined => {
    if (!text) return undefined;
    if (typeof text === "string") return text;
    return text[currentLanguage] || text.fr || text.en;
  };

  // Récupérer les détails des builds pour avoir les titres
  const buildsDetailsQuery = useQuery({
    queryKey: ["recentActivityDetails", containerId, currentLanguage, recentActivity.map(a => a.buildName)],
    queryFn: async () => {
      if (!containerId || recentActivity.length === 0) {
        return [];
      }

      // Récupérer tous les builds via l'API
      const buildTypes = [...new Set(recentActivity.map(a => a.buildType))];

      const buildsByType = await Promise.all(
        buildTypes.map(async (buildType) => {
          const params = new URLSearchParams({
            containerId,
            type: buildType,
          });

          const response = await fetch(`/api/builds?${params.toString()}`);
          if (!response.ok) {
            return [];
          }

          const data = await response.json();
          return data.builds || [];
        })
      );

      const allBuilds = buildsByType.flat();

      // Mapper les activités avec les détails des builds
      return recentActivity.map((activity) => {
        const build = allBuilds.find(
          (b: Build) => b.name === activity.buildName || b.id === activity.buildName
        );

        return {
          ...activity,
          displayName: getLocalizedText(build?.metadata?.title) || build?.name || activity.buildName,
          metadata: build?.metadata,
          build,
        };
      });
    },
    enabled: isReady && !!containerId && recentActivity.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    activities: buildsDetailsQuery.data || [],
    isLoading: isStatsLoading || buildsDetailsQuery.isLoading,
    error: statsError || buildsDetailsQuery.error,
  };
}
