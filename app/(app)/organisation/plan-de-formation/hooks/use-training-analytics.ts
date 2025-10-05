import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrganizationStore } from "@/stores/organization-store";
import { toast } from "sonner";
import type { GetTrainingAnalyticsQuery } from "@/validators";
import type { AnalyticsResponse } from "@/types/training";

// Hook pour récupérer les analytics avec filtres
export function useTrainingAnalytics(filters?: Partial<GetTrainingAnalyticsQuery>) {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["training-analytics", activeOrganization?.id, filters],
    queryFn: async (): Promise<AnalyticsResponse> => {
      const params = new URLSearchParams();

      // Ajouter l'organizationId si disponible
      if (activeOrganization?.id) {
        params.append("organizationId", activeOrganization.id);
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await fetch(`/api/training/analytics?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Analytics API error:", error);
        throw new Error(error.error || "Erreur lors de la récupération des analytics");
      }

      return response.json();
    },
    enabled: !!activeOrganization?.id, // Activer seulement si organisation présente
    staleTime: 0, // Toujours refetch pour avoir les données à jour
    refetchOnMount: true, // Refetch quand le composant est monté
    refetchOnWindowFocus: true, // Refetch quand la fenêtre reprend le focus
  });
}

// Hook pour récupérer les analytics d'un membre spécifique
export function useMemberAnalytics(userId: string) {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["member-analytics", activeOrganization?.id, userId],
    queryFn: async (): Promise<AnalyticsResponse> => {
      const params = new URLSearchParams();

      if (activeOrganization?.id) {
        params.append("organizationId", activeOrganization.id);
      }

      if (userId) {
        params.append("userId", userId);
      }

      const response = await fetch(`/api/training/analytics?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la récupération des analytics");
      }

      return response.json();
    },
    enabled: !!userId, // Seulement si un userId est fourni
  });
}

// Hook pour récupérer les détails d'une session
export function useSessionDetails(sessionId: string) {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["session-details", activeOrganization?.id, sessionId],
    queryFn: async () => {
      if (!activeOrganization) {
        throw new Error("Aucune organisation active");
      }

      const response = await fetch(`/api/training/analytics/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la récupération de la session");
      }

      return response.json();
    },
    enabled: !!activeOrganization && !!sessionId,
  });
}

// Hook pour exporter les analytics
export function useExportAnalytics() {
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: async ({ format, filters }: { format: 'csv' | 'excel', filters?: Record<string, unknown> }) => {
      if (!activeOrganization) {
        throw new Error("Aucune organisation active");
      }

      const params = new URLSearchParams({
        format,
        ...filters,
      });

      const response = await fetch(`/api/training/analytics/export?${params}`, {
        method: "GET",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'export");
      }

      if (format === 'csv') {
        // Pour le CSV, on récupère le blob directement
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true };
      } else {
        // Pour Excel, on récupère les données JSON
        // Le client devra utiliser une librairie comme SheetJS
        return response.json();
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Export réussi");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook pour les analytics d'un tag de formation
export function useTagAnalytics(tagId: string) {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["tag-analytics", activeOrganization?.id, tagId],
    queryFn: async (): Promise<AnalyticsResponse> => {
      if (!activeOrganization) {
        throw new Error("Aucune organisation active");
      }

      const response = await fetch(`/api/training/analytics?tagId=${tagId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la récupération des analytics");
      }

      return response.json();
    },
    enabled: !!activeOrganization && !!tagId,
  });
}

// Hook pour les analytics avec plage de dates
export function useAnalyticsByDateRange(startDate?: string, endDate?: string) {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["analytics-date-range", activeOrganization?.id, startDate, endDate],
    queryFn: async (): Promise<AnalyticsResponse> => {
      if (!activeOrganization) {
        throw new Error("Aucune organisation active");
      }

      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/training/analytics?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la récupération des analytics");
      }

      return response.json();
    },
    enabled: !!activeOrganization,
  });
}