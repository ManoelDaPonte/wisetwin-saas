"use client";

import { BuildsTable } from "../../components/builds-table";
import { Build } from "@/lib/azure";

export default function MesFormationsTermineesPage() {
  // TODO: Implémenter la logique pour récupérer les formations terminées depuis l'API
  const completedTrainings: { builds: Build[] } = { builds: [] };
  const isLoading = false;
  const error = null;

  return (
    <div className="h-full flex flex-col">
      <BuildsTable
        builds={completedTrainings}
        isLoading={isLoading}
        error={error}
        title="Mes Formations Terminées"
        description="Consultez l'historique de vos formations terminées"
        mode="my-trainings"
      />
    </div>
  );
}