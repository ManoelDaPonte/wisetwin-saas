"use client";

import { BuildsTable } from "@/app/(app)/(features-unity)/components/builds-table";
import { useBuilds } from "@/app/hooks/use-builds";

export default function WisetrainerPage() {
  const {
    data: builds,
    error,
    isLoading,
    followBuild,
    unfollowBuild,
    isFollowLoading,
    isUnfollowLoading,
  } = useBuilds("wisetrainer");

  return (
    <div className="h-full flex flex-col">
      <BuildsTable
        builds={builds}
        isLoading={isLoading}
        error={error}
        title="Formations disponibles"
        description="Explorez et lancez les modules de formation Unity"
        mode="catalog"
        followBuild={followBuild}
        unfollowBuild={unfollowBuild}
        isFollowLoading={isFollowLoading}
        isUnfollowLoading={isUnfollowLoading}
      />
    </div>
  );
}
