"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wrench, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import type {
  TrainingAnalytics,
  ProcedureInteractionData,
  ResolvedInteraction,
  ProcedureStepAnalyticsData,
} from "@/types/training";

interface ProcedureAnalyticsProps {
  procedures: ProcedureStats[];
  sessions: TrainingAnalytics[];
}

// Type étendu pour les stats de procédure avec détails des étapes
interface ProcedureStats {
  title: string;
  totalAttempts: number;
  successCount: number;
  failCount: number;
  totalDuration: number;
  avgDuration?: number;
  steps: string[];
}

interface ProcedureStepStats {
  stepNumber: number;
  title: string;
  completionCount: number;
  totalAttempts: number;
  avgDuration: number;
  errorCount: number; // Nombre de personnes ayant fait des erreurs
  errorRate: number; // Pourcentage de personnes s'étant trompées
}

export function ProcedureAnalytics({
  procedures,
  sessions,
}: ProcedureAnalyticsProps) {
  if (procedures.length === 0) {
    return null;
  }

  // Fonction pour agréger les statistiques détaillées par étape
  const getProcedureStepsStats = (
    procedureTitle: string
  ): ProcedureStepStats[] => {
    const stepsMap = new Map<number, ProcedureStepStats>();

    sessions.forEach((session) => {
      const procedureInteractions = session.interactions.filter((i) => {
        if (i.type !== "procedure") return false;
        const resolved = i as ResolvedInteraction;
        const data = i.data as ProcedureInteractionData;
        const title =
          resolved.resolvedData?.procedureTitle ||
          data.procedureKey ||
          "Procédure";
        return title === procedureTitle;
      }) as ResolvedInteraction[];

      procedureInteractions.forEach((interaction) => {
        const procedureData = interaction.data as ProcedureInteractionData;
        const resolvedSteps = interaction.resolvedData?.steps;

        procedureData.steps?.forEach(
          (step: ProcedureStepAnalyticsData, idx: number) => {
            const stepNumber = step.stepNumber;
            const stepTitle =
              resolvedSteps?.[idx]?.title ||
              step.stepKey ||
              `Étape ${stepNumber}`;

            const existing = stepsMap.get(stepNumber) || {
              stepNumber,
              title: stepTitle,
              completionCount: 0,
              totalAttempts: 0,
              avgDuration: 0,
              errorCount: 0,
              errorRate: 0,
            };

            existing.totalAttempts++;
            if (step.completed) {
              existing.completionCount++;
            }
            existing.avgDuration += step.duration;

            // Compter si cette personne a fait des erreurs sur cette étape
            if (step.wrongClicksOnThisStep > 0) {
              existing.errorCount++;
            }

            stepsMap.set(stepNumber, existing);
          }
        );
      });
    });

    // Calculer les moyennes et le pourcentage d'erreur
    return Array.from(stepsMap.values())
      .map((step) => ({
        ...step,
        avgDuration: step.avgDuration / step.totalAttempts,
        errorRate:
          step.totalAttempts > 0
            ? (step.errorCount / step.totalAttempts) * 100
            : 0,
      }))
      .sort((a, b) => a.stepNumber - b.stepNumber);
  };

  // Trier par difficulté (moins de succès en premier)
  const sortedProcedures = [...procedures].sort((a, b) => {
    const aSuccessRate = (a.successCount / a.totalAttempts) * 100;
    const bSuccessRate = (b.successCount / b.totalAttempts) * 100;
    return aSuccessRate - bSuccessRate;
  });

  return (
    <div className="space-y-4">
      <h3 className="font-medium flex items-center gap-2">
        <Wrench className="h-4 w-4" />
        Analyse des procédures ({procedures.length})
      </h3>

      {sortedProcedures.map((procedure, index) => {
        const successRate =
          (procedure.successCount / procedure.totalAttempts) * 100;
        const failureRate =
          (procedure.failCount / procedure.totalAttempts) * 100;
        const avgDurationMin = Math.round((procedure.avgDuration || 0) / 60);
        const stepsStats = getProcedureStepsStats(procedure.title);

        return (
          <Card
            key={index}
            className={
              successRate < 60
                ? "border-red-500/50 dark:border-red-500/30"
                : successRate < 80
                ? "border-yellow-500/50 dark:border-yellow-500/30"
                : "border-green-500/50 dark:border-green-500/30"
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm mb-2">
                    {procedure.title.length > 100
                      ? procedure.title.substring(0, 100) + "..."
                      : procedure.title}
                  </CardTitle>
                  {avgDurationMin > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {avgDurationMin} min moy.
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {successRate.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">de réussite</p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Visualisation des étapes */}
              {stepsStats.length > 0 && (
                <div className="space-y-3 mb-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Détail par étape:
                  </p>
                  {stepsStats.map((step) => {
                    const hasErrors = step.errorRate > 0;

                    return (
                      <div
                        key={step.stepNumber}
                        className={`p-3 rounded-lg border ${
                          hasErrors
                            ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                            : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {hasErrors ? (
                                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              )}
                              <span className="font-medium text-sm">
                                Étape {step.stepNumber}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">
                              {step.title}
                            </p>
                          </div>
                          <div className="text-right shrink-0 space-y-1">
                            <p className="text-xs text-muted-foreground">
                              {step.avgDuration.toFixed(1)}s moy.
                            </p>
                            {hasErrors && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                {step.errorRate.toFixed(0)}% se sont trompés
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Statistiques résumées */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <div className="text-center bg-green-500/10 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Réussite</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {successRate.toFixed(0)}%
                  </p>
                </div>
                <div className="text-center bg-red-500/10 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Échec</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {failureRate.toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
