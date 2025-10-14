"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, Users, BookOpen, Download, Calendar } from "lucide-react";
import {
  useTrainingAnalytics,
  useExportAnalytics,
} from "../../organisation/plan-de-formation/hooks/use-training-analytics";
import { MemberAnalyticsV2 } from "./member-analytics-v2";
import { TrainingMetricsV2 } from "./training-metrics-v2";

interface AnalyticsDashboardProps {
  organizationId: string;
}

export function AnalyticsDashboardV2({
  organizationId,
}: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("7days");

  // Calculer les dates selon la période sélectionnée avec useMemo pour éviter les re-renders
  const { startDate, endDate } = React.useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "7days":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, [selectedPeriod]);

  // Récupérer les analytics - seulement WISETRAINER
  const { data, isLoading, error } = useTrainingAnalytics({
    startDate,
    endDate,
    buildType: "WISETRAINER",
  });

  // Hook pour l'export
  const exportMutation = useExportAnalytics();

  // Gérer l'export
  const handleExport = () => {
    exportMutation.mutate({
      format: "csv",
      filters: {
        startDate,
        endDate,
        buildType: "WISETRAINER",
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-destructive">
            Erreur lors du chargement des analytics: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Si pas de données, afficher un message
  if (!data || data.analytics.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header avec export et sélecteur */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Statistiques de formation
            </h1>
            <p className="text-muted-foreground">
              Analysez les performances et la progression des formations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd&apos;hui</SelectItem>
                <SelectItem value="7days">7 derniers jours</SelectItem>
                <SelectItem value="30days">30 derniers jours</SelectItem>
                <SelectItem value="90days">90 derniers jours</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={true}
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-3">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">
                Aucune donnée d&apos;analytics
              </h3>
              <p className="text-sm text-muted-foreground">
                Les statistiques apparaîtront ici une fois que des formations
                WiseTrainer auront été complétées.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const aggregates = data?.aggregates;

  return (
    <div className="space-y-6">
      {/* Header avec export et sélecteur */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Statistiques de formation
          </h1>
          <p className="text-muted-foreground">
            Analysez les performances et la progression des formations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd&apos;hui</SelectItem>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="90days">90 derniers jours</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistiques résumé rapide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total complétions
                </p>
                <p className="text-2xl font-bold">
                  {aggregates?.statusBreakdown?.COMPLETED || 0}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Score moyen
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(aggregates?.averageScore ?? 0)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="text-2xl font-bold">
                  {new Set(data?.analytics.map((a) => a.user.id)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Interactions totales
                </p>
                <p className="text-2xl font-bold">
                  {aggregates?.totalInteractions || 0}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets simplifiés */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Par utilisateur
          </TabsTrigger>
          <TabsTrigger value="trainings" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Par formation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MemberAnalyticsV2
            organizationId={organizationId}
            startDate={startDate}
            endDate={endDate}
            analytics={data?.analytics || []}
          />
        </TabsContent>

        <TabsContent value="trainings">
          <TrainingMetricsV2
            organizationId={organizationId}
            startDate={startDate}
            endDate={endDate}
            analytics={data?.analytics || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
