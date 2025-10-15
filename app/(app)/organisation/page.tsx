"use client";

import { useEffect, useMemo } from "react";
import { useOrganizationStore } from "@/stores/organization-store";
import { useOrganizations } from "@/app/hooks/use-organizations";
import { useMembers } from "./hooks/use-members";
import { useBuilds } from "@/app/hooks/use-builds";
import { useTrainingAnalytics } from "./plan-de-formation/hooks/use-training-analytics";
import { useTranslations } from "@/hooks/use-translations";
import { OrganizationStats } from "./components/organization-stats";
import { OrganizationActions } from "./components/organization-actions";
import { OrganizationTrends } from "./components/organization-trends";

export default function OrganizationPage() {
  const { activeOrganization } = useOrganizationStore();
  const { fetchOrganizations } = useOrganizations();
  const t = useTranslations();

  const { members, isLoading: isMembersLoading } = useMembers();
  const { data: wisetrainerBuilds, isLoading: isWisetrainerLoading } =
    useBuilds("wisetrainer");

  // Récupérer les analytics pour toute l'organisation
  const { data: analyticsData, isLoading: isAnalyticsLoading } =
    useTrainingAnalytics({
      buildType: "WISETRAINER",
    });

  // Rafraîchir les données des organisations au montage du composant
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const memberCount = members?.length || 0;
  const wisetrainerCount = wisetrainerBuilds?.builds?.length || 0;

  // Calculer les stats globales depuis les analytics
  const totalFormationsCompleted =
    analyticsData?.analytics?.filter((a) => a.completionStatus === "COMPLETED")
      .length || 0;

  const totalTimeSpent = useMemo(() => {
    if (!analyticsData?.analytics) return 0;
    const totalSeconds = analyticsData.analytics
      .filter((a) => a.completionStatus === "COMPLETED")
      .reduce((sum, a) => sum + a.totalDuration, 0);
    return totalSeconds / 3600; // Convertir en heures
  }, [analyticsData]);

  if (!activeOrganization) {
    return null;
  }

  // Vérifier si l'utilisateur est un membre (pas admin/owner)
  const isMember = activeOrganization.role === "MEMBER";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t.navigation.organizationOverview}
        </h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre organisation et des performances
        </p>
      </div>

      {/* Statistiques rapides */}
      <OrganizationStats
        memberCount={memberCount}
        wisetrainerCount={wisetrainerCount}
        totalFormationsCompleted={totalFormationsCompleted}
        totalTimeSpent={totalTimeSpent}
        isMembersLoading={isMembersLoading}
        isWisetrainerLoading={isWisetrainerLoading}
        isStatsLoading={isAnalyticsLoading}
      />

      {/* Actions rapides - cachées pour les membres */}
      <OrganizationActions canManage={!isMember} />

      {/* Graphique de tendances */}
      <OrganizationTrends
        isLoading={isAnalyticsLoading}
        analyticsData={analyticsData?.analytics}
      />
    </div>
  );
}
