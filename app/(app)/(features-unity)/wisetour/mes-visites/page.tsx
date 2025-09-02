"use client";

import { BuildsTable } from "../../components/builds-table";
import { useBuilds } from "@/app/hooks/use-builds";
import { useTranslations } from "@/hooks/use-translations";

export default function MesVisitesPage() {
  const t = useTranslations();
  const {
    data: builds,
    error,
    isLoading,
  } = useBuilds("wisetour", { followedOnly: true });

  return (
    <div className="h-full flex flex-col">
      <BuildsTable
        builds={builds}
        isLoading={isLoading}
        error={error}
        title={t.myVisits.title}
        description={t.myVisits.subtitle}
        mode="my-trainings"
      />
    </div>
  );
}
