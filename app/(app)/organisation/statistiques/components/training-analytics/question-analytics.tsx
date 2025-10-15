"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart3, Clock } from "lucide-react";
import type {
  QuestionStats,
  QuestionUserResponse,
  TrainingAnalytics,
  ResolvedInteraction,
  QuestionInteractionData,
  InteractionData,
} from "@/types/training";

interface QuestionAnalyticsProps {
  questions: QuestionStats[];
  sessions?: TrainingAnalytics[];
}

export function QuestionAnalytics({ questions, sessions = [] }: QuestionAnalyticsProps) {
  if (questions.length === 0) {
    return null;
  }

  const getInteractionDurationSeconds = (interaction: InteractionData): number => {
    const hasNumericDuration =
      typeof interaction.duration === "number" && !Number.isNaN(interaction.duration);

    const parseTime = (value: Date | string | undefined): number | null => {
      if (!value) return null;
      const date = typeof value === "string" ? new Date(value) : value;
      const timestamp = date.getTime();
      return Number.isNaN(timestamp) ? null : timestamp;
    };

    const startTimestamp = parseTime(interaction.startTime);
    const endTimestamp = parseTime(interaction.endTime);

    if (startTimestamp !== null && endTimestamp !== null) {
      const diffSeconds = (endTimestamp - startTimestamp) / 1000;
      if (Number.isFinite(diffSeconds) && diffSeconds > 0) {
        // Retourner le temps calculé via les timestamps si disponible
        return diffSeconds;
      }
    }

    return hasNumericDuration ? interaction.duration : 0;
  };

  // Fonction pour calculer la durée moyenne d'une question
  const getAverageQuestionDuration = (questionText: string): number => {
    let totalDuration = 0;
    let count = 0;

    sessions.forEach((session) => {
      session.interactions.forEach((interaction) => {
        if (interaction.type !== "question") return;

        const resolved = interaction as ResolvedInteraction;
        const data = interaction.data as QuestionInteractionData;
        const text = resolved.resolvedData?.questionText || data.questionKey || "Question";

        if (text === questionText) {
          totalDuration += getInteractionDurationSeconds(interaction);
          count++;
        }
      });
    });

    return count > 0 ? totalDuration / count : 0;
  };

  // Trier par difficulté (moins de succès à la première tentative en premier)
  const sortedQuestions = [...questions].sort((a, b) => {
    const aFirstAttemptSuccess = a.userResponses.filter(
      (r) => r.firstAttemptCorrect
    ).length;
    const bFirstAttemptSuccess = b.userResponses.filter(
      (r) => r.firstAttemptCorrect
    ).length;
    const aRate =
      a.userResponses.length > 0
        ? (aFirstAttemptSuccess / a.userResponses.length) * 100
        : 0;
    const bRate =
      b.userResponses.length > 0
        ? (bFirstAttemptSuccess / b.userResponses.length) * 100
        : 0;
    return aRate - bRate;
  });

  return (
    <div className="space-y-4">
      <h3 className="font-medium flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        Analyse des questions ({questions.length})
      </h3>

      {sortedQuestions.map((question, index) => {
        // Calculer les statistiques de première tentative
        const firstAttemptStats = question.userResponses.reduce(
          (acc, response) => {
            if (response.firstAttemptCorrect) {
              acc.correct++;
            } else {
              acc.incorrect++;
            }
            return acc;
          },
          { correct: 0, incorrect: 0 }
        );

        const firstAttemptSuccessRate =
          question.userResponses.length > 0
            ? (firstAttemptStats.correct / question.userResponses.length) * 100
            : 0;

        const firstAttemptFailureRate =
          question.userResponses.length > 0
            ? (firstAttemptStats.incorrect / question.userResponses.length) * 100
            : 0;

        // Calculer la distribution des réponses À LA PREMIÈRE TENTATIVE SEULEMENT
        const firstAttemptDistribution = question.options.map(
          (option: string, optionIndex: number) => {
            const timesChosenFirstAttempt = question.userResponses.reduce(
              (count: number, response: QuestionUserResponse) => {
                // Vérifier uniquement la première tentative
                if (
                  response.userAnswers &&
                  Array.isArray(response.userAnswers) &&
                  response.userAnswers.length > 0
                ) {
                  const firstAttempt = response.userAnswers[0];
                  if (
                    Array.isArray(firstAttempt) &&
                    firstAttempt.includes(optionIndex)
                  ) {
                    return count + 1;
                  }
                }
                return count;
              },
              0
            );

            const percentage =
              question.userResponses.length > 0
                ? (timesChosenFirstAttempt / question.userResponses.length) * 100
                : 0;

            return {
              option,
              optionIndex,
              count: timesChosenFirstAttempt,
              percentage,
              isCorrect: question.correctAnswers.includes(optionIndex),
            };
          }
        );

        return (
          <Card
            key={index}
            className={
              firstAttemptSuccessRate < 60
                ? "border-red-500/50 dark:border-red-500/30"
                : firstAttemptSuccessRate < 80
                ? "border-yellow-500/50 dark:border-yellow-500/30"
                : "border-green-500/50 dark:border-green-500/30"
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm mb-2">
                    Question {index + 1}: {question.text}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-muted-foreground">
                      {question.userResponses.length} participant
                      {question.userResponses.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {Math.round(getAverageQuestionDuration(question.text))}s moy.
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Histogramme en colonnes */}
              <div className="space-y-4 mb-4">
                <div className="flex items-end justify-around gap-2 h-48 border-b border-l border-border p-4">
                  {firstAttemptDistribution.map((dist) => {
                    // Utilise le pourcentage réel de réponses pour piloter la hauteur
                    const heightPercentage = dist.percentage;

                    return (
                      <div
                        key={dist.optionIndex}
                        className="flex-1 flex flex-col justify-end items-center gap-2 h-full"
                      >
                        {/* Nombre de réponses au-dessus de la barre */}
                        <div className="text-xs font-medium">
                          {dist.count > 0 ? `${dist.percentage.toFixed(0)}%` : ""}
                        </div>
                        {/* Conteneur de barre pour contrôler la hauteur en fonction du pourcentage */}
                        <div
                          className="relative w-full flex-1 h-full"
                          style={{
                            minHeight: dist.count > 0 ? "8px" : "0px",
                          }}
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all bg-gray-400 dark:bg-gray-600"
                            style={{
                              height:
                                dist.count > 0 ? `${heightPercentage}%` : "0%",
                              minHeight: dist.count > 0 ? "8px" : "0px",
                            }}
                          />
                        </div>

                        {/* Label (A, B, C, D) */}
                        <div className="text-center">
                          <p className="font-medium text-sm">
                            {String.fromCharCode(65 + dist.optionIndex)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Légende des options avec mise en évidence des bonnes réponses */}
                <div className="space-y-1 text-sm">
                  {firstAttemptDistribution.map((dist) => (
                    <div
                      key={dist.optionIndex}
                      className={`flex items-start gap-2 p-2 rounded ${
                        dist.isCorrect
                          ? "bg-green-500/10 border border-green-500/30"
                          : ""
                      }`}
                    >
                      <span className="font-medium shrink-0">
                        {String.fromCharCode(65 + dist.optionIndex)}.
                      </span>
                      <span
                        className={
                          dist.isCorrect
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {dist.option}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistiques résumées */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <div className="text-center bg-green-500/10 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Réussite</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {firstAttemptSuccessRate.toFixed(0)}%
                  </p>
                </div>
                <div className="text-center bg-red-500/10 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Échec</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {firstAttemptFailureRate.toFixed(0)}%
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
