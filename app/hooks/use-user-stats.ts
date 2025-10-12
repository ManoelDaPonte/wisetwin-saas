import { useQuery } from "@tanstack/react-query";
import { useContainer } from "./use-container";
import { useSession } from "next-auth/react";

export interface UserStats {
  totalFormationsCompleted: number;
  wisetrainerCompletions: number;
  wisetourVisits: number;
  totalTimeSpent: number; // en heures
  averageScore: number; // pourcentage
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: 'completion';
  buildName: string;
  buildType: 'wisetrainer' | 'wisetour';
  timestamp: string;
  score?: number; // Score obtenu (pourcentage)
  imageUrl?: string; // URL de l'image de la formation
}


async function fetchUserStats(
  containerId: string, 
  organizationId: string | null, 
  userId: string
): Promise<UserStats> {
  const params = new URLSearchParams({
    containerId,
    userId,
  });

  if (organizationId) {
    params.append("organizationId", organizationId);
  }

  const response = await fetch(`/api/user/stats?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch user statistics");
  }

  return response.json();
}

export function useUserStats() {
  const { containerId, isPersonalSpace, organizationId, isReady } = useContainer();
  const { data: session } = useSession();

  const query = useQuery({
    queryKey: ["userStats", containerId, organizationId, session?.user?.id],
    queryFn: () => fetchUserStats(containerId!, organizationId, session?.user?.id || ''),
    enabled: isReady && !!session?.user?.id && !!containerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    stats: query.data,
    isPersonalSpace,
  };
}

