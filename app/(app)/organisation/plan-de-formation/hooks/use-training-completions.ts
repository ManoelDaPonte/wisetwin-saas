import { useQuery } from "@tanstack/react-query";
import { useOrganizationStore } from "@/stores/organization-store";
import { TrainingAnalytics } from "@/types/training";

/**
 * Hook pour récupérer les completions de formation via TrainingAnalytics
 * Utilisé pour calculer les stats de progression des plans de formation
 */
export function useTrainingCompletions() {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["training-completions", activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization?.id) {
        throw new Error("No active organization");
      }

      const params = new URLSearchParams({
        organizationId: activeOrganization.id,
        buildType: "WISETRAINER",
        completionStatus: "COMPLETED",
        limit: "1000", // Récupérer toutes les completions
      });

      const response = await fetch(`/api/training/analytics?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch training completions");
      }

      const data = await response.json();

      // Créer une structure de données optimisée pour les lookups
      // Map: buildName -> Set<userId>
      const completionMap = new Map<string, Set<string>>();

      data.analytics.forEach((analytics: TrainingAnalytics) => {
        const { buildName, user } = analytics;
        if (!completionMap.has(buildName)) {
          completionMap.set(buildName, new Set());
        }
        completionMap.get(buildName)!.add(user.id);
      });

      return {
        completionMap,
        analytics: data.analytics,
        totalCompletions: data.analytics.length,
      };
    },
    enabled: !!activeOrganization?.id,
    staleTime: 60 * 1000, // 1 minute
    refetchOnMount: true,
  });
}
