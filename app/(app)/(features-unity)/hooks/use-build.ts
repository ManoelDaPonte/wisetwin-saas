"use client";

import { useQuery } from "@tanstack/react-query";
import { Build, BuildType } from "@/lib/azure";

interface BuildResponse {
  builds: Build[];
}

async function fetchBuild(buildType: BuildType, buildId: string, containerId: string): Promise<Build | null> {
  const params = new URLSearchParams({
    type: buildType,
    containerId: containerId,
  });

  const response = await fetch(`/api/builds?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch builds: ${response.statusText}`);
  }

  const data: BuildResponse = await response.json();
  
  // Trouver le build spécifique par son ID ou nom
  const build = data.builds.find(b => (b.id || b.name) === buildId);
  return build || null;
}

export function useBuild(buildType: BuildType | null, buildId: string, containerId: string) {
  return useQuery({
    queryKey: ["build", buildType, buildId, containerId],
    queryFn: () => fetchBuild(buildType!, buildId, containerId),
    enabled: Boolean(buildType && buildId && containerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}