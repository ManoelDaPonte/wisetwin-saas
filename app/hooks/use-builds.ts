import { useQuery } from "@tanstack/react-query";
import { useContainer } from "./use-container";
import { Build, BuildType } from "@/types/azure-types";

interface BuildsOptions {
  followedOnly?: boolean;
}

async function fetchBuilds(
  containerId: string,
  buildType: BuildType,
  options: BuildsOptions = {}
): Promise<{ builds: Build[] }> {
  const params = new URLSearchParams({
    containerId,
    type: buildType,
  });

  if (options.followedOnly) {
    params.append("followedOnly", "true");
  }

  const response = await fetch(`/api/builds?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch builds");
  }

  return response.json();
}



export function useBuilds(buildType: BuildType, options: BuildsOptions = {}) {
  const { containerId, isReady } = useContainer();

  const query = useQuery({
    queryKey: ["builds", containerId, buildType, options],
    queryFn: () => fetchBuilds(containerId!, buildType, options),
    enabled: isReady && !!containerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
  };
}
