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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Users, Clock, ChevronRight, BarChart3, Wrench } from "lucide-react";
import type {
  TrainingAnalytics,
  TrainingDetails,
  TrainingStatsWithQuestions,
  QuestionStats,
  QuestionUserResponse,
  InteractionData,
  QuestionInteractionData,
  ProcedureInteractionData,
  ProcedureStats,
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
  const [selectedVersion, setSelectedVersion] = useState<string>("all");

  // Extraire les versions disponibles et les normaliser
  const availableVersions = React.useMemo(() => {
    const versions = new Set<string>();
    analytics.forEach((session) => {
      const version = session.buildVersion || "1.0.0"; // Version par défaut pour anciennes données
      versions.add(version);
    });
    return Array.from(versions).sort((a, b) => {
      // Tri sémantique des versions (ex: 1.0.0 < 1.0.1 < 1.1.0)
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0;
        const bPart = bParts[i] || 0;
        if (aPart !== bPart) return bPart - aPart; // Ordre décroissant
      }
      return 0;
    });
  }, [analytics]);

  // Filtrer les analytics par version
  const filteredAnalytics = React.useMemo(() => {
    if (selectedVersion === "all") return analytics;
    return analytics.filter((session) => {
      const version = session.buildVersion || "1.0.0";
      return version === selectedVersion;
    });
  }, [analytics, selectedVersion]);

  // Agréger les données par formation
  const trainingStats = React.useMemo(() => {
    const stats = new Map<string, TrainingStatsWithQuestions>();

    filteredAnalytics.forEach((session) => {
      const key = session.buildName;
      const existing = stats.get(key) || {
        buildName: session.buildName,
        uniqueUsers: new Set<string>(),
        sessions: [] as TrainingAnalytics[],
        totalDuration: 0,
        averageSuccessRate: 0,
        completedCount: 0,
        allQuestions: new Map<string, QuestionStats>(),
        allProcedures: new Map(),
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

        // Analyser les procédures
        if (interaction.type === "procedure" && interaction.data) {
          const procedureData = interaction.data as ProcedureInteractionData;
          // Utiliser title si disponible, sinon instruction tronqué
          const procedureTitle = procedureData.title ||
            (procedureData.instruction ?
              procedureData.instruction.substring(0, 100) +
              (procedureData.instruction.length > 100 ? "..." : "")
              : "Procédure");

          const existingProcedure = existing.allProcedures.get(procedureTitle) || {
            title: procedureTitle,
            totalAttempts: 0,
            successCount: 0,
            failCount: 0,
            avgDuration: 0,
            totalDuration: 0,
            steps: [],
          };

          existingProcedure.totalAttempts++;
          existingProcedure.totalDuration += interaction.duration;

          if (interaction.success) {
            existingProcedure.successCount++;
          } else {
            existingProcedure.failCount++;
          }

          // Ajouter les détails de l'étape si pas déjà présent
          const stepInfo = `Étape ${procedureData.stepNumber}/${procedureData.totalSteps}`;
          if (!existingProcedure.steps.includes(stepInfo)) {
            existingProcedure.steps.push(stepInfo);
          }

          existing.allProcedures.set(procedureTitle, existingProcedure);
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
      proceduresArray: stat.allProcedures ? Array.from(stat.allProcedures.values()).map(p => ({
        ...p,
        avgDuration: p.totalAttempts > 0 ? p.totalDuration / p.totalAttempts : 0,
      })) : [],
    }));
  }, [filteredAnalytics]);

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Résultats par formation</CardTitle>
              <CardDescription>
                Cliquez sur une formation pour voir les résultats moyens par
                question
              </CardDescription>
            </div>
            {availableVersions.length > 1 && (
              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes versions</SelectItem>
                  {availableVersions.map((version) => (
                    <SelectItem key={version} value={version}>
                      Version {version}
                      {version === "1.0.0" && " (Legacy)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
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
        <DialogContent className="max-w-7xl max-h-[90vh]">
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
            <ScrollArea className="h-[75vh] pr-4">
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
                                          // Vérifier dans toutes les tentatives de cet utilisateur
                                          let selectedInThisResponse = false;
                                          if (response.userAnswers && Array.isArray(response.userAnswers)) {
                                            // userAnswers est un tableau de tableaux (historique des tentatives)
                                            for (const attempt of response.userAnswers) {
                                              if (Array.isArray(attempt) && attempt.includes(i)) {
                                                selectedInThisResponse = true;
                                                break;
                                              }
                                            }
                                          }
                                          return count + (selectedInThisResponse ? 1 : 0);
                                        },
                                        0
                                      );

                                    const chosenPercentage =
                                      question.totalAttempts > 0
                                        ? (timesChosen / question.totalAttempts) * 100
                                        : 0;

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

                {/* Analyse des procédures */}
                {selectedTraining.data?.proceduresArray &&
                 selectedTraining.data.proceduresArray.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Procédures ({selectedTraining.data.proceduresArray.length})
                    </h3>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">
                          Liste des procédures
                        </CardTitle>
                        <CardDescription>
                          Toutes les procédures réalisées avec leurs statistiques de réussite
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedTraining.data.proceduresArray
                            .sort((a: ProcedureStats, b: ProcedureStats) => {
                              const aSuccessRate =
                                (a.successCount / a.totalAttempts) * 100;
                              const bSuccessRate =
                                (b.successCount / b.totalAttempts) * 100;
                              return aSuccessRate - bSuccessRate; // Trier par difficulté
                            })
                            .map((procedure: ProcedureStats, index: number) => {
                              const successRate =
                                (procedure.successCount / procedure.totalAttempts) * 100;
                              const avgDurationMin = Math.round((procedure.avgDuration || 0) / 60);

                              return (
                                <div
                                  key={index}
                                  className={`p-4 rounded-lg border ${
                                    successRate < 60
                                      ? "border-red-500/50 dark:border-red-500/30 bg-red-500/5"
                                      : successRate < 80
                                      ? "border-yellow-500/50 dark:border-yellow-500/30 bg-yellow-500/5"
                                      : "border-green-500/50 dark:border-green-500/30 bg-green-500/5"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-muted-foreground">
                                          #{index + 1}
                                        </span>
                                        <p className="font-medium text-sm">
                                          {procedure.title.length > 100
                                            ? procedure.title.substring(0, 100) + "..."
                                            : procedure.title}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>
                                          {procedure.totalAttempts} tentative{procedure.totalAttempts > 1 ? 's' : ''}
                                        </span>
                                        <span>•</span>
                                        <span>
                                          {procedure.steps.length} étape{procedure.steps.length > 1 ? 's' : ''}
                                        </span>
                                        {avgDurationMin > 0 && (
                                          <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              {avgDurationMin} min moy.
                                            </span>
                                          </>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Progress
                                          value={successRate}
                                          className="h-2 flex-1"
                                        />
                                        <Badge
                                          variant={
                                            successRate < 60
                                              ? "destructive"
                                              : successRate < 80
                                              ? "secondary"
                                              : "default"
                                          }
                                          className="text-xs"
                                        >
                                          {successRate.toFixed(0)}%
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-center shrink-0">
                                      <div className="bg-green-500/10 px-3 py-2 rounded">
                                        <p className="text-xs text-muted-foreground">Réussies</p>
                                        <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                          {procedure.successCount}
                                        </p>
                                      </div>
                                      <div className="bg-red-500/10 px-3 py-2 rounded">
                                        <p className="text-xs text-muted-foreground">Échouées</p>
                                        <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                          {procedure.failCount}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

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
