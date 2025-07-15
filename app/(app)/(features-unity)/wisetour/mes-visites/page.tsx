"use client";

import { BuildsTable } from "../../components/builds-table";
import { useBuilds } from "@/app/hooks/use-builds";

export default function MesVisitesPage() {
  const {
    data: builds,
    error,
    isLoading,
    followBuild,
    unfollowBuild,
    isFollowLoading,
    isUnfollowLoading,
  } = useBuilds("wisetour", { followedOnly: true });

  return (
    <div className="h-full flex flex-col">
      <BuildsTable
        builds={builds}
        isLoading={isLoading}
        error={error}
        title="Mes Visites"
        description="Gérez et suivez vos visites industrielles en cours"
        mode="my-trainings"
        followBuild={followBuild}
        unfollowBuild={unfollowBuild}
        isFollowLoading={isFollowLoading}
        isUnfollowLoading={isUnfollowLoading}
      />
    </div>
  );
}
