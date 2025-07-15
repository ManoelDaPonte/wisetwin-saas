import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContainer } from "./use-container";
import { Build, BuildType } from "@/lib/azure";

interface BuildsOptions {
  followedOnly?: boolean;
}

interface FollowBuildParams {
  buildName: string;
  buildType: BuildType;
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

async function followBuild(
  params: FollowBuildParams & { containerId: string }
) {
  const response = await fetch("/api/builds/follow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to follow build");
  }

  return response.json();
}

async function unfollowBuild(
  params: FollowBuildParams & { containerId: string }
) {
  const searchParams = new URLSearchParams({
    buildName: params.buildName,
    buildType: params.buildType,
    containerId: params.containerId,
  });

  const response = await fetch(
    `/api/builds/follow?${searchParams.toString()}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to unfollow build");
  }

  return response.json();
}

export function useBuilds(buildType: BuildType, options: BuildsOptions = {}) {
  const { containerId, isReady } = useContainer();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["builds", containerId, buildType, options],
    queryFn: () => fetchBuilds(containerId!, buildType, options),
    enabled: isReady && !!containerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
    refetchOnWindowFocus: false,
  });

  const followMutation = useMutation({
    mutationFn: (params: FollowBuildParams) =>
      followBuild({ ...params, containerId: containerId! }),
    onSuccess: () => {
      // Invalidate both the catalog and followed builds queries
      queryClient.invalidateQueries({
        queryKey: ["builds", containerId, buildType],
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (params: FollowBuildParams) =>
      unfollowBuild({ ...params, containerId: containerId! }),
    onSuccess: () => {
      // Invalidate both the catalog and followed builds queries
      queryClient.invalidateQueries({
        queryKey: ["builds", containerId, buildType],
      });
    },
  });

  return {
    ...query,
    followBuild: followMutation.mutate,
    unfollowBuild: unfollowMutation.mutate,
    isFollowLoading: followMutation.isPending,
    isUnfollowLoading: unfollowMutation.isPending,
    followError: followMutation.error,
    unfollowError: unfollowMutation.error,
  };
}
