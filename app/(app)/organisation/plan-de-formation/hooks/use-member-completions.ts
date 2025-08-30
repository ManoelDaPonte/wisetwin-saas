import { useQuery } from "@tanstack/react-query";
import { useOrganizationStore } from "@/stores/organization-store";

interface MemberCompletion {
  id: string;
  userId: string;
  buildName: string;
  buildType: "WISETOUR" | "WISETRAINER";
  containerId: string;
  progress: number;
  completedAt: Date;
  startedAt: Date;
  lastAccessedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface MemberCompletionsResponse {
  memberCompletions: MemberCompletion[];
  total: number;
}

async function fetchMemberCompletions(
  organizationId: string,
  buildType: string = "WISETRAINER"
): Promise<MemberCompletionsResponse> {
  const params = new URLSearchParams({
    organizationId,
    buildType,
  });

  const response = await fetch(`/api/training-management/member-completions?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des completions");
  }

  return response.json();
}

export function useMemberCompletions(buildType: string = "WISETRAINER") {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["member-completions", activeOrganization?.id, buildType],
    queryFn: () => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return fetchMemberCompletions(activeOrganization.id, buildType);
    },
    enabled: !!activeOrganization?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}