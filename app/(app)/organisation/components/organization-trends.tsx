"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrainingAnalytics } from "@/types/training";
import { useTranslations } from "@/hooks/use-translations";

interface OrganizationTrendsProps {
  isLoading?: boolean;
  analyticsData?: TrainingAnalytics[];
}

interface MonthlyData {
  month: string;
  monthShort: string;
  year: number;
  monthYear: string;
  completions: number;
  hours: number;
  activityScore: number;
}

export function OrganizationTrends({
  isLoading,
  analyticsData,
}: OrganizationTrendsProps) {
  const t = useTranslations();

  // Agréger les données par mois à partir des vraies données
  const trendData = useMemo(() => {
    const months = [
      t.organization.trends.months.jan,
      t.organization.trends.months.feb,
      t.organization.trends.months.mar,
      t.organization.trends.months.apr,
      t.organization.trends.months.may,
      t.organization.trends.months.jun,
      t.organization.trends.months.jul,
      t.organization.trends.months.aug,
      t.organization.trends.months.sep,
      t.organization.trends.months.oct,
      t.organization.trends.months.nov,
      t.organization.trends.months.dec,
    ];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Initialiser les 12 derniers mois avec des valeurs à 0
    const monthlyData: MonthlyData[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthIndex = date.getMonth();
      monthlyData.push({
        month: months[monthIndex],
        monthShort: months[monthIndex].substring(0, 3),
        year: date.getFullYear(),
        monthYear: `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`,
        completions: 0,
        hours: 0,
        activityScore: 0,
      });
    }

    // Si on a des données réelles, les agréger par mois
    if (analyticsData && analyticsData.length > 0) {
      analyticsData.forEach((session) => {
        // Utiliser startTime pour déterminer le mois
        const sessionDate = new Date(session.startTime);
        const sessionMonthYear = `${sessionDate.getFullYear()}-${String(
          sessionDate.getMonth() + 1
        ).padStart(2, "0")}`;

        // Trouver le mois correspondant dans notre tableau
        const monthData = monthlyData.find(
          (m) => m.monthYear === sessionMonthYear
        );

        if (monthData) {
          // Compter seulement les formations terminées
          if (session.completionStatus === "COMPLETED") {
            monthData.completions += 1;
            // La durée est déjà en secondes, on la convertit en heures
            monthData.hours +=
              Math.round((session.totalDuration / 3600) * 10) / 10; // Arrondi à 1 décimale
          }
        }
      });

      // Calculer le score d'activité pour chaque mois
      monthlyData.forEach((month) => {
        // Score basé sur le nombre de formations et les heures
        month.activityScore = Math.round(
          month.completions * 10 + month.hours * 2
        );
      });
    }

    return monthlyData;
  }, [analyticsData, t]);

  // Calcul de la tendance d'évolution
  const trend = useMemo(() => {
    // Comparer les 3 derniers mois avec les 3 mois précédents
    const lastThree = trendData
      .slice(-3)
      .reduce((sum, d) => sum + d.completions, 0);
    const previousThree = trendData
      .slice(-6, -3)
      .reduce((sum, d) => sum + d.completions, 0);

    // Si aucune donnée dans la période précédente, on ne peut pas calculer de tendance
    if (previousThree === 0) {
      if (lastThree > 0) return 100; // Si on a des données maintenant mais pas avant = +100%
      return 0; // Pas de données du tout
    }

    // Calcul du pourcentage d'évolution
    return ((lastThree - previousThree) / previousThree) * 100;
  }, [trendData]);

  const maxScore = Math.max(...trendData.map((d) => d.activityScore), 1); // Au minimum 1 pour éviter division par 0
  const hasData = trendData.some((d) => d.completions > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t.organization.trends.title}
            </CardTitle>
            <CardDescription>{t.organization.trends.subtitle}</CardDescription>
          </div>
          {hasData && (
            <div className="text-right">
              <div className="flex items-center gap-1">
                {trend > 5 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : trend < -5 ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : (
                  <Activity className="h-5 w-5 text-gray-500" />
                )}
                <span
                  className={`text-2xl font-bold ${
                    trend > 5
                      ? "text-green-500"
                      : trend < -5
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {trend > 0 ? "+" : ""}
                  {trend.toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.organization.trends.evolutionLabel}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (
                {trendData.slice(-3).reduce((sum, d) => sum + d.completions, 0)}{" "}
                {t.organization.trends.recentTrainings})
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-10">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-end gap-1 h-10">
              {trendData.map((data, index) => {
                const height = (data.activityScore / maxScore) * 100;
                const isCurrentMonth = index === trendData.length - 1;
                const isLastThreeMonths = index >= trendData.length - 3;

                // Définir les couleurs selon la position et la performance
                let barClass = "";
                let barStyle = {};

                if (isCurrentMonth) {
                  // Mois actuel en couleur vive
                  barClass = "bg-green-500 dark:bg-green-400";
                } else if (isLastThreeMonths) {
                  // 3 derniers mois en bleu
                  barClass = "bg-blue-500 dark:bg-blue-400";
                  barStyle = {
                    opacity: 0.8 + (index - (trendData.length - 3)) * 0.1,
                  };
                } else {
                  // Mois plus anciens en gris avec gradient
                  barClass = "bg-gray-400 dark:bg-gray-500";
                  barStyle = {
                    opacity: 0.3 + (index / trendData.length) * 0.4,
                  };
                }

                return (
                  <div key={index} className="flex-1 min-w-0 relative group">
                    <div className="relative h-full flex items-end">
                      <div
                        className={`
												w-full rounded-t-md transition-all duration-300 hover:brightness-110
												${barClass}
											`}
                        style={{
                          height: `${height}%`,
                          minHeight: "4px",
                          ...barStyle,
                        }}
                      >
                        {/* Tooltip au hover */}
                        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none border shadow-lg">
                          <div className="font-semibold text-sm">
                            {data.month}
                          </div>
                          <div className="space-y-1 mt-2">
                            {data.completions > 0 ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-500">●</span>
                                  <span>
                                    {data.completions}{" "}
                                    {data.completions > 1
                                      ? t.organization.trends.trainings
                                      : t.organization.trends.training}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-blue-500">●</span>
                                  <span>
                                    {data.hours.toFixed(1)}h{" "}
                                    {t.organization.trends.ofTraining}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="text-muted-foreground">
                                {t.organization.trends.noActivity}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Valeur au-dessus des barres qui ont des données */}
                        {data.completions > 0 && (
                          <div
                            className={`absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold ${
                              isCurrentMonth
                                ? "text-green-500"
                                : isLastThreeMonths
                                ? "text-blue-500"
                                : "text-gray-500"
                            }`}
                          >
                            {data.completions}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Labels des mois */}
                    <div
                      className={`text-xs text-center mt-2 ${
                        isLastThreeMonths
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {data.monthShort}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Légende */}
            <div className="flex items-center gap-4 mt-8 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gray-400 opacity-50"></div>
                <span className="text-muted-foreground">
                  {t.organization.trends.legend.history}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-muted-foreground">
                  {t.organization.trends.legend.lastThreeMonths}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-muted-foreground">
                  {t.organization.trends.legend.currentMonth}
                </span>
              </div>
            </div>

            {/* Message si pas de données */}
            {!hasData && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded">
                <p className="text-muted-foreground text-sm">
                  {t.organization.trends.noDataMessage}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
