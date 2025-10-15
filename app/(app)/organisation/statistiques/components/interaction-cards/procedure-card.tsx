"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type {
  ProcedureInteractionData,
  ResolvedInteraction,
} from "@/types/training";

interface ProcedureCardProps {
  interaction: ResolvedInteraction;
}

export function ProcedureCard({ interaction }: ProcedureCardProps) {
  const procedureData = interaction.data as ProcedureInteractionData;
  const isSuccess = interaction.success;

  // Titre de la procédure - utiliser resolvedData ou fallback sur la clé
  const title =
    interaction.resolvedData?.procedureTitle ||
    procedureData.procedureKey ||
    "Procédure";

  return (
    <Card
      key={interaction.interactionId}
      className={isSuccess ? "border-green-500/30" : "border-red-500/30"}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="font-medium flex-1">{title}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            <Clock className="h-3 w-3 inline mr-1" />
            {Math.round(interaction.duration)}s
          </span>
        </div>

        {/* Badge de complétion parfaite */}
        {procedureData.perfectCompletion && (
          <div className="mb-4 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-xs text-green-600 dark:text-green-400">
              ✓ Procédure réalisée parfaitement
            </p>
          </div>
        )}

        {/* Liste détaillée des étapes */}
        {procedureData.steps && procedureData.steps.length > 0 && (
          <div className="space-y-2 pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Détail des étapes :
            </p>
            {procedureData.steps.map((step, idx) => {
              // Récupérer les infos résolues si disponibles
              const resolvedStep = interaction.resolvedData?.steps?.[idx];
              const stepTitle = resolvedStep?.title || step.stepKey;

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-md text-xs ${
                    step.completed
                      ? step.wrongClicksOnThisStep > 0
                        ? "bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800"
                        : "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          Étape {step.stepNumber}:
                        </span>
                      </div>
                      <p className="font-medium text-foreground">
                        {stepTitle}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-muted-foreground">
                        {step.duration.toFixed(1)}s
                      </p>
                      {step.wrongClicksOnThisStep > 0 && (
                        <p className="text-red-600 dark:text-red-400">
                          {step.wrongClicksOnThisStep} erreur
                          {step.wrongClicksOnThisStep > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
