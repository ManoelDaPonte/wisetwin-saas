"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type {
  QuestionInteractionData,
  ResolvedInteraction,
} from "@/types/training";

interface QuestionCardProps {
  interaction: ResolvedInteraction;
}

export function QuestionCard({ interaction }: QuestionCardProps) {
  const questionData = interaction.data as QuestionInteractionData;

  // Gestion rétrocompatible pour déterminer le type de question
  const isMultipleChoice =
    interaction.subtype === "multiple_choice" ||
    (!interaction.subtype &&
      (questionData.correctAnswers &&
        questionData.correctAnswers.length > 1 ||
        questionData.userAnswers?.some(
          (answers) => answers && answers.length > 1
        )));

  const userAnswers = questionData.userAnswers || [];

  // Critère de validation : première tentative correcte
  const isFirstAttemptCorrect = questionData.firstAttemptCorrect;

  // Obtenir le texte de la question - utiliser resolvedData ou fallback
  const questionText =
    interaction.resolvedData?.questionText ||
    questionData.questionKey ||
    "Question";
  const options = interaction.resolvedData?.options || [];

  // Calculer les options choisies par l'utilisateur (toutes tentatives confondues)
  const userSelectedOptions = new Set<number>();
  userAnswers.forEach((attempt) => {
    attempt.forEach((optionIdx) => userSelectedOptions.add(optionIdx));
  });

  return (
    <Card
      key={interaction.interactionId}
      className={isFirstAttemptCorrect ? "border-green-500/30" : "border-red-500/30"}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="font-medium flex-1">{questionText}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            <Clock className="h-3 w-3 inline mr-1" />
            {Math.round(interaction.duration)}s
          </span>
        </div>

        {/* Timeline des tentatives - toujours affichée */}
        {userAnswers.length > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Parcours ({userAnswers.length} tentative
              {userAnswers.length > 1 ? "s" : ""}) :
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {userAnswers.map((attempt, attemptIdx) => {
                const attemptCorrect =
                  attempt.length === questionData.correctAnswers?.length &&
                  attempt.every((a) =>
                    questionData.correctAnswers?.includes(a)
                  );

                return (
                  <div
                    key={attemptIdx}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                      attemptCorrect
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                    }`}
                  >
                    <span className="font-medium">{attemptIdx + 1}.</span>
                    <span>
                      {attempt.length > 0
                        ? attempt.map((i) => String.fromCharCode(65 + i)).join(", ")
                        : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Options */}
        <div className="space-y-2">
          {options.map((option: string, i: number) => {
            const isCorrect = questionData.correctAnswers?.includes(i);
            const wasChosen = userSelectedOptions.has(i);

            // Définir le style selon le statut de l'option
            let bgClass = "";
            let borderClass = "";
            let iconBg = "";
            let iconSymbol = "";

            if (isCorrect) {
              // Bonne réponse (toujours en vert)
              bgClass = "bg-green-50 dark:bg-green-950/20";
              borderClass = "border-green-200 dark:border-green-800";
              iconBg = "bg-green-500 border-green-500";
              iconSymbol = "✓";
            } else {
              // Option choisie ou non (style neutre/grisé identique)
              bgClass = "bg-muted/30";
              borderClass = "border-muted-foreground/20";
              iconBg = "bg-muted border-muted-foreground/30";
              iconSymbol = "";
            }

            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border ${bgClass} ${borderClass}`}
              >
                <div className="flex items-center mt-0.5">
                  <div
                    className={`w-4 h-4 ${
                      isMultipleChoice ? "rounded" : "rounded-full"
                    } border-2 flex items-center justify-center ${iconBg}`}
                  >
                    {iconSymbol && (
                      <span className="text-white text-xs font-bold">
                        {iconSymbol}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <p
                    className={`text-sm ${isCorrect ? "font-medium" : ""} ${
                      !isCorrect && !wasChosen ? "text-muted-foreground" : ""
                    }`}
                  >
                    <span className="text-muted-foreground mr-2">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {option}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
