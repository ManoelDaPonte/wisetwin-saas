"use client";

import { useOrganizationStore } from "@/stores/organization-store";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { AnalyticsDashboardV2 } from "./components/analytics-dashboard-v2";

export default function StatistiquesPage() {
  const { activeOrganization } = useOrganizationStore();

  // Si pas d'organisation active
  if (!activeOrganization) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">
                Sélectionnez une organisation
              </h3>
              <p className="text-sm text-muted-foreground">
                Veuillez sélectionner une organisation pour voir les
                statistiques de formation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vérification des permissions (OWNER/ADMIN seulement)
  if (activeOrganization.role === "MEMBER") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Accès restreint</h3>
              <p className="text-muted-foreground">
                Seuls les administrateurs et propriétaires peuvent accéder aux
                statistiques de formation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Dashboard d'analytics avec header intégré */}
      <AnalyticsDashboardV2 organizationId={activeOrganization.id} />
    </div>
  );
}
