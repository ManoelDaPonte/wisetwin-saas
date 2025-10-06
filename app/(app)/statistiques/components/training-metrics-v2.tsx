"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, Clock, ChevronRight, BarChart3 } from "lucide-react";
import type {
  TrainingAnalytics,
  TrainingDetails,
  TrainingStatsWithQuestions,
  QuestionStats,
  QuestionUserResponse,
  InteractionData,
  QuestionInteractionData,
} from "@/types/training";

interface TrainingMetricsProps {
  organizationId: string;
  startDate?: string;
  endDate?: string;
  analytics: TrainingAnalytics[];
}

export function TrainingMetricsV2({ analytics }: TrainingMetricsProps) {
  const [selectedTraining, setSelectedTraining] = useState<TrainingDetails>({
    trainingName: "",
    visible: false,
    data: null,
  });

  // Agréger les données par formation
  const trainingStats = React.useMemo(() => {
    const stats = new Map<string, TrainingStatsWithQuestions>();

    analytics.forEach((session) => {
      const key = session.buildName;
      const existing = stats.get(key) || {
        buildName: session.buildName,
        uniqueUsers: new Set<string>(),
        sessions: [] as TrainingAnalytics[],
        totalDuration: 0,
        averageSuccessRate: 0,
        completedCount: 0,
        allQuestions: new Map<string, QuestionStats>(),
      };

      existing.uniqueUsers.add(session.user.id);
      existing.sessions.push(session);
      existing.totalDuration += session.totalDuration;
      existing.averageSuccessRate += session.successRate;

      if (session.completionStatus === "COMPLETED") {
        existing.completedCount++;
      }

      // Analyser les questions de chaque session
      const interactions = session.interactions as InteractionData[];
      interactions?.forEach((interaction) => {
        if (interaction.type === "question" && interaction.data) {
          const questionData = interaction.data as QuestionInteractionData;
          const questionText = questionData.questionText;
          const existingQuestion = existing.allQuestions.get(questionText) || {
            text: questionText,
            totalAttempts: 0,
            successCount: 0,
            failCount: 0,
            options: questionData.options || [],
            correctAnswers: questionData.correctAnswers || [],
            userResponses: [],
          };

          existingQuestion.totalAttempts++;
          if (interaction.success) {
            existingQuestion.successCount++;
          } else {
            existingQuestion.failCount++;
          }

          existingQuestion.userResponses.push({
            userId: session.user.id,
            userName: session.user.name || session.user.email,
            success: interaction.success,
            attempts: interaction.attempts,
            userAnswers: questionData.userAnswers,
            firstAttemptCorrect: questionData.firstAttemptCorrect,
          });

          existing.allQuestions.set(questionText, existingQuestion);
        }
      });

      stats.set(key, existing);
    });

    // Convertir en tableau et calculer les moyennes
    return Array.from(stats.values()).map((stat) => ({
      ...stat,
      averageSuccessRate:
        stat.sessions.length > 0
          ? stat.averageSuccessRate / stat.sessions.length
          : 0,
      averageDuration:
        stat.sessions.length > 0
          ? stat.totalDuration / stat.sessions.length
          : 0,
      completionRate:
        stat.sessions.length > 0
          ? (stat.completedCount / stat.sessions.length) * 100
          : 0,
      uniqueUsersCount: stat.uniqueUsers.size,
      questionsArray: Array.from(stat.allQuestions.values()),
    }));
  }, [analytics]);

  const showTrainingDetails = (training: TrainingStatsWithQuestions) => {
    setSelectedTraining({
      trainingName: training.buildName,
      visible: true,
      data: training,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Résultats par formation</CardTitle>
          <CardDescription>
            Cliquez sur une formation pour voir les résultats moyens par
            question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Formation</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Score moyen</TableHead>
                <TableHead>Durée moyenne</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainingStats.map((stat) => (
                <TableRow key={stat.buildName}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{stat.buildName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {stat.uniqueUsersCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({stat.sessions.length} sessions)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        stat.averageSuccessRate >= 80
                          ? "default"
                          : stat.averageSuccessRate >= 60
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {stat.averageSuccessRate.toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {Math.round(stat.averageDuration / 60)} min
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showTrainingDetails(stat)}
                    >
                      Voir détails
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {trainingStats.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Aucune donnée de formation pour cette période
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour les détails de formation */}
      <Dialog
        open={selectedTraining.visible}
        onOpenChange={(open) =>
          setSelectedTraining({ ...selectedTraining, visible: open })
        }
      >
        <DialogContent className="max-w-5xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>
              Analyse détaillée : {selectedTraining.trainingName}
            </DialogTitle>
            <DialogDescription>
              {selectedTraining.data && (
                <>
                  {selectedTraining.data.uniqueUsersCount} participants •
                  {selectedTraining.data.sessions.length} sessions • Score
                  moyen: {selectedTraining.data.averageSuccessRate.toFixed(1)}%
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedTraining.data && (
            <ScrollArea className="h-[65vh] pr-4">
              <div className="space-y-6">
                {/* Vue d'ensemble */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Vue d&apos;ensemble
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Participants uniques
                        </p>
                        <p className="text-xl font-bold">
                          {selectedTraining.data.uniqueUsersCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Sessions complétées
                        </p>
                        <p className="text-xl font-bold">
                          {selectedTraining.data.completedCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Taux de réussite moyen
                        </p>
                        <p className="text-xl font-bold">
                          {selectedTraining.data.averageSuccessRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Questions analysées
                        </p>
                        <p className="text-xl font-bold">
                          {selectedTraining.data?.questionsArray?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analyse par question */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Résultats moyens par question
                  </h3>

                  {selectedTraining.data?.questionsArray
                    ?.sort((a: QuestionStats, b: QuestionStats) => {
                      const aSuccessRate =
                        (a.successCount / a.totalAttempts) * 100;
                      const bSuccessRate =
                        (b.successCount / b.totalAttempts) * 100;
                      return aSuccessRate - bSuccessRate; // Trier par difficulté (moins de succès en premier)
                    })
                    .map((question: QuestionStats, index: number) => {
                      const successRate =
                        (question.successCount / question.totalAttempts) * 100;
                      const difficulty =
                        successRate < 60
                          ? "Difficile"
                          : successRate < 80
                          ? "Modérée"
                          : "Facile";

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
                                <p className="font-medium text-sm mb-2">
                                  Question {index + 1}: {question.text}
                                </p>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant={
                                      difficulty === "Difficile"
                                        ? "destructive"
                                        : difficulty === "Modérée"
                                        ? "secondary"
                                        : "default"
                                    }
                                  >
                                    {difficulty}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {question.totalAttempts} tentatives totales
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold">
                                  {successRate.toFixed(0)}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  de réussite
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {/* Options et réponses correctes */}
                            <div className="space-y-3 mb-4">
                              <p className="text-sm font-medium text-muted-foreground">
                                Réponses possibles:
                              </p>
                              <div className="space-y-2">
                                {question.options.map(
                                  (option: string, i: number) => {
                                    const isCorrect =
                                      question.correctAnswers.includes(i);

                                    // Calculer combien de fois cette option a été choisie
                                    const timesChosen =
                                      question.userResponses.reduce(
                                        (count: number, response: QuestionUserResponse) => {
                                          if (
                                            response.userAnswers?.[0]?.includes(
                                              i
                                            )
                                          ) {
                                            return count + 1;
                                          }
                                          return count;
                                        },
                                        0
                                      );

                                    const chosenPercentage =
                                      (timesChosen / question.totalAttempts) *
                                      100;

                                    return (
                                      <div
                                        key={i}
                                        className={`p-3 rounded-lg border ${
                                          isCorrect
                                            ? "bg-green-500/10 border-green-500/50 dark:bg-green-500/10 dark:border-green-500/30"
                                            : "bg-muted/50"
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex-1">
                                            <p className="text-sm">
                                              <span className="font-medium mr-2">
                                                {String.fromCharCode(65 + i)}.
                                              </span>
                                              {option}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm font-medium">
                                              {timesChosen} /{" "}
                                              {question.totalAttempts}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              ({chosenPercentage.toFixed(0)}%)
                                            </p>
                                            {isCorrect && (
                                              <Badge
                                                variant="outline"
                                                className="mt-1 text-xs border-green-500/50 text-green-700 dark:text-green-400"
                                              >
                                                ✓ Correct
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        <Progress
                                          value={chosenPercentage}
                                          className="h-2 mt-2"
                                        />
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>

                            {/* Statistiques détaillées */}
                            <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                  Réussites
                                </p>
                                <p className="font-medium text-green-600">
                                  {question.successCount}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                  Échecs
                                </p>
                                <p className="font-medium text-red-600">
                                  {question.failCount}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                  Moy. tentatives
                                </p>
                                <p className="font-medium">
                                  {(
                                    question.userResponses.reduce(
                                      (sum: number, r: QuestionUserResponse) => sum + r.attempts,
                                      0
                                    ) / question.userResponses.length
                                  ).toFixed(1)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>

                {/* Liste des participants avec leurs résultats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Détail par participant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Participant</TableHead>
                          <TableHead>Sessions</TableHead>
                          <TableHead>Score moyen</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from(selectedTraining.data.uniqueUsers).map(
                          (userId: string) => {
                            const userSessions =
                              selectedTraining.data!.sessions.filter(
                                (s: TrainingAnalytics) => s.user.id === userId
                              );
                            const avgScore =
                              userSessions.reduce(
                                (sum: number, s: TrainingAnalytics) => sum + s.successRate,
                                0
                              ) / userSessions.length;
                            const hasCompleted = userSessions.some(
                              (s: TrainingAnalytics) => s.completionStatus === "COMPLETED"
                            );

                            return (
                              <TableRow key={userId}>
                                <TableCell>
                                  {userSessions[0].user.name ||
                                    userSessions[0].user.email}
                                </TableCell>
                                <TableCell>{userSessions.length}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      avgScore >= 80
                                        ? "default"
                                        : avgScore >= 60
                                        ? "secondary"
                                        : "destructive"
                                    }
                                  >
                                    {avgScore.toFixed(1)}%
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {hasCompleted ? (
                                    <Badge variant="default">Complété</Badge>
                                  ) : (
                                    <Badge variant="secondary">En cours</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          }
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
