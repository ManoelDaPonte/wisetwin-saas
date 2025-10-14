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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Users, Clock, ChevronRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { VersionRow } from "./training-analytics";
import { QuestionCard, ProcedureCard, TextCard } from "./interaction-cards";
import type {
  TrainingAnalytics,
  TrainingStatsWithQuestions,
  QuestionStats,
  InteractionData,
  QuestionInteractionData,
  ProcedureInteractionData,
  ResolvedInteraction,
  ProcedureStepAnalyticsData,
} from "@/types/training";

interface TrainingMetricsProps {
  organizationId: string;
  startDate?: string;
  endDate?: string;
  analytics: TrainingAnalytics[];
}

export function TrainingMetricsV2({ analytics }: TrainingMetricsProps) {
  const [expandedTrainings, setExpandedTrainings] = useState<Set<string>>(
    new Set()
  );
  const [selectedSession, setSelectedSession] = useState<TrainingAnalytics | null>(
    null
  );
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);

  // Fonction pour basculer l'expansion d'une formation
  const toggleTrainingExpansion = (trainingName: string) => {
    const newExpanded = new Set(expandedTrainings);
    if (newExpanded.has(trainingName)) {
      newExpanded.delete(trainingName);
    } else {
      newExpanded.add(trainingName);
    }
    setExpandedTrainings(newExpanded);
  };

  // Gérer le clic sur une session
  const handleSessionClick = (session: TrainingAnalytics) => {
    setSelectedSession(session);
    setSessionDialogOpen(true);
  };

  // Grouper les analytics par formation
  const trainingsByName = React.useMemo(() => {
    const grouped = new Map<string, TrainingAnalytics[]>();

    analytics.forEach((session) => {
      const name = session.buildName;
      if (!grouped.has(name)) {
        grouped.set(name, []);
      }
      grouped.get(name)!.push(session);
    });

    return grouped;
  }, [analytics]);

  // Calculer les stats globales par formation (toutes versions confondues)
  const trainingGlobalStats = React.useMemo(() => {
    const stats = new Map<
      string,
      {
        buildName: string;
        displayName: string;
        imageUrl?: string;
        uniqueUsers: Set<string>;
        totalSessions: number;
        averageScore: number;
        averageDuration: number;
        versions: string[];
      }
    >();

    trainingsByName.forEach((sessions, trainingName) => {
      const uniqueUsers = new Set<string>();
      let totalScore = 0;
      let totalDuration = 0;
      const versions = new Set<string>();
      let displayName = "";
      let imageUrl = "";

      sessions.forEach((session) => {
        uniqueUsers.add(session.user.id);
        totalScore += session.score;
        totalDuration += session.totalDuration;
        versions.add(session.buildVersion || "1.0.0");

        if (!displayName && session.displayName) {
          displayName = session.displayName;
        }

        if (!imageUrl && session.imageUrl) {
          imageUrl = session.imageUrl;
        }
      });

      stats.set(trainingName, {
        buildName: trainingName,
        displayName: displayName || trainingName,
        imageUrl: imageUrl || undefined,
        uniqueUsers,
        totalSessions: sessions.length,
        averageScore: sessions.length > 0 ? totalScore / sessions.length : 0,
        averageDuration: sessions.length > 0 ? totalDuration / sessions.length : 0,
        versions: Array.from(versions).sort((a, b) => {
          // Tri sémantique des versions
          const aParts = a.split(".").map(Number);
          const bParts = b.split(".").map(Number);
          for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aPart = aParts[i] || 0;
            const bPart = bParts[i] || 0;
            if (aPart !== bPart) return bPart - aPart; // Ordre décroissant
          }
          return 0;
        }),
      });
    });

    return stats;
  }, [trainingsByName]);

  // Calculer les stats détaillées pour une formation et une version spécifique
  const getTrainingVersionStats = (
    trainingName: string,
    version: string,
    displayNameHint?: string,
    imageUrlHint?: string
  ): TrainingStatsWithQuestions => {
    const allSessions = trainingsByName.get(trainingName) || [];
    const filteredSessions = allSessions.filter(
      (s) => (s.buildVersion || "1.0.0") === version
    );

    const firstSession = filteredSessions[0];

    const stats: TrainingStatsWithQuestions = {
      buildName: trainingName,
      displayName:
        displayNameHint ||
        firstSession?.displayName ||
        trainingName,
      imageUrl:
        imageUrlHint ||
        firstSession?.imageUrl ||
        undefined,
      metadata: firstSession?.metadata ?? null,
      uniqueUsers: new Set<string>(),
      sessions: filteredSessions,
      totalDuration: 0,
      averageScore: 0,
      completedCount: 0,
      allQuestions: new Map<string, QuestionStats>(),
      allProcedures: new Map(),
      averageDuration: 0,
      completionRate: 0,
      uniqueUsersCount: 0,
      questionsArray: [],
      proceduresArray: [],
    };

    filteredSessions.forEach((session) => {
      stats.uniqueUsers.add(session.user.id);
      stats.totalDuration += session.totalDuration;
      stats.averageScore += session.score;

      if (!stats.displayName && session.displayName) {
        stats.displayName = session.displayName;
      }

      if (!stats.imageUrl && session.imageUrl) {
        stats.imageUrl = session.imageUrl;
      }

      if (!stats.metadata && session.metadata) {
        stats.metadata = session.metadata;
      }

      if (session.completionStatus === "COMPLETED") {
        stats.completedCount++;
      }

      // Analyser les questions de chaque session
      const interactions = session.interactions as InteractionData[];
      interactions?.forEach((interaction) => {
        if (interaction.type === "question" && interaction.data) {
          const questionData = interaction.data as QuestionInteractionData;
          const resolved = interaction as ResolvedInteraction;

          const questionText =
            resolved.resolvedData?.questionText ||
            questionData.questionKey ||
            "Question sans texte";
          const options = resolved.resolvedData?.options || [];

          const existingQuestion = stats.allQuestions.get(questionText) || {
            text: questionText,
            totalAttempts: 0,
            successCount: 0,
            failCount: 0,
            options: options,
            correctAnswers: questionData.correctAnswers || [],
            userResponses: [],
          };

          existingQuestion.totalAttempts++;

          if (questionData.finalScore === 100) {
            existingQuestion.successCount++;
          } else {
            existingQuestion.failCount++;
          }

          existingQuestion.userResponses.push({
            userId: session.user.id,
            userName: session.user.name || session.user.email,
            success: questionData.finalScore === 100,
            attempts: interaction.attempts,
            userAnswers: questionData.userAnswers,
            firstAttemptCorrect: questionData.firstAttemptCorrect,
          });

          stats.allQuestions.set(questionText, existingQuestion);
        }

        // Analyser les procédures
        if (interaction.type === "procedure" && interaction.data) {
          const procedureData = interaction.data as ProcedureInteractionData;
          const resolved = interaction as ResolvedInteraction;

          const procedureTitle =
            resolved.resolvedData?.procedureTitle ||
            procedureData.procedureKey ||
            "Procédure";

          const existingProcedure = stats.allProcedures?.get(procedureTitle) || {
            title: procedureTitle,
            totalAttempts: 0,
            successCount: 0,
            failCount: 0,
            avgDuration: 0,
            totalDuration: 0,
            steps: [],
          };

          existingProcedure.totalAttempts++;
          existingProcedure.totalDuration +=
            procedureData.totalDuration || interaction.duration;

          if (procedureData.perfectCompletion) {
            existingProcedure.successCount++;
          } else {
            existingProcedure.failCount++;
          }

          const resolvedSteps = resolved.resolvedData?.steps;
          if (resolvedSteps && resolvedSteps.length > 0) {
            resolvedSteps.forEach((step) => {
              const stepInfo = `Étape ${step.stepNumber}: ${
                step.title || step.instruction.substring(0, 50)
              }`;
              if (!existingProcedure.steps.includes(stepInfo)) {
                existingProcedure.steps.push(stepInfo);
              }
            });
          } else if (procedureData.steps && procedureData.steps.length > 0) {
            procedureData.steps.forEach((step: ProcedureStepAnalyticsData) => {
              const stepInfo = `Étape ${step.stepNumber}: ${step.stepKey}`;
              if (!existingProcedure.steps.includes(stepInfo)) {
                existingProcedure.steps.push(stepInfo);
              }
            });
          }

          stats.allProcedures?.set(procedureTitle, existingProcedure);
        }
      });
    });

    // Calculer les moyennes
    stats.averageScore =
      stats.sessions.length > 0
        ? stats.averageScore / stats.sessions.length
        : 0;
    stats.averageDuration =
      stats.sessions.length > 0
        ? stats.totalDuration / stats.sessions.length
        : 0;
    stats.completionRate =
      stats.sessions.length > 0
        ? (stats.completedCount / stats.sessions.length) * 100
        : 0;
    stats.uniqueUsersCount = stats.uniqueUsers.size;
    stats.questionsArray = Array.from(stats.allQuestions.values());
    stats.proceduresArray = stats.allProcedures
      ? Array.from(stats.allProcedures.values()).map((p) => ({
          ...p,
          avgDuration: p.totalAttempts > 0 ? p.totalDuration / p.totalAttempts : 0,
        }))
      : [];

    return stats;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Résultats par formation</CardTitle>
          <CardDescription>
            Cliquez sur une formation pour voir les versions disponibles
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
                <TableHead>Versions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(trainingGlobalStats.entries()).map(
                ([trainingName, stat]) => {
                  const isExpanded = expandedTrainings.has(trainingName);

                  return (
                    <React.Fragment key={trainingName}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/30"
                        onClick={() => toggleTrainingExpansion(trainingName)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3 min-w-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTrainingExpansion(trainingName);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            {stat.imageUrl ? (
                              <Image
                                src={stat.imageUrl}
                                alt={stat.displayName}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {stat.displayName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {stat.buildName}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {stat.uniqueUsers.size}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({stat.totalSessions} sessions)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              stat.averageScore >= 80
                                ? "default"
                                : stat.averageScore >= 60
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {Math.round(stat.averageScore)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {Math.round(stat.averageDuration / 60)} min
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {stat.versions.map((v) => (
                              <Badge key={v} variant="outline" className="text-xs">
                                v{v}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Liste des versions (affichée seulement si expandée) */}
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/30 p-6">
                            <div className="space-y-4">
                              <h3 className="font-semibold text-lg mb-4">
                                {`${stat.displayName || trainingName} - Versions disponibles`}
                              </h3>

                              {stat.versions.map((version) => {
                                const versionStats = getTrainingVersionStats(
                                  trainingName,
                                  version,
                                  stat.displayName,
                                  stat.imageUrl
                                );

                                return (
                                  <VersionRow
                                    key={version}
                                    version={version}
                                    versionStats={versionStats}
                                    trainingName={trainingName}
                                    trainingDisplayName={
                                      stat.displayName || trainingName
                                    }
                                    trainingImageUrl={stat.imageUrl}
                                    onSessionClick={handleSessionClick}
                                  />
                                );
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                }
              )}
            </TableBody>
          </Table>

          {trainingGlobalStats.size === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Aucune donnée de formation pour cette période
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour les détails d'une session individuelle */}
      <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Détails de la session</DialogTitle>
            <DialogDescription>
              {selectedSession && (
                <>
                  {selectedSession.displayName || selectedSession.buildName} •{" "}
                  {selectedSession.user.name || selectedSession.user.email}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <ScrollArea className="h-[75vh]">
              <div className="space-y-4 pr-4">
                {/* Procédures */}
                {(() => {
                  const procedures = selectedSession.interactions.filter(
                    (i) => i.type === "procedure"
                  ) as ResolvedInteraction[];

                  if (procedures.length === 0) return null;

                  return (
                    <div className="space-y-4">
                      <h3 className="font-medium">
                        Procédures ({procedures.length})
                      </h3>
                      {procedures.map((interaction) => (
                        <ProcedureCard
                          key={interaction.interactionId}
                          interaction={interaction}
                        />
                      ))}
                    </div>
                  );
                })()}

                {/* Questions */}
                {(() => {
                  const questions = selectedSession.interactions.filter(
                    (i) => i.type === "question"
                  ) as ResolvedInteraction[];

                  if (questions.length === 0) return null;

                  return (
                    <div className="space-y-4">
                      <h3 className="font-medium">
                        Questions ({questions.length})
                      </h3>
                      {questions.map((interaction) => (
                        <QuestionCard
                          key={interaction.interactionId}
                          interaction={interaction}
                        />
                      ))}
                    </div>
                  );
                })()}

                {/* Textes */}
                {(() => {
                  const texts = selectedSession.interactions.filter(
                    (i) => i.type === "text"
                  ) as ResolvedInteraction[];

                  if (texts.length === 0) return null;

                  return (
                    <div className="space-y-4">
                      <h3 className="font-medium">Textes ({texts.length})</h3>
                      {texts.map((interaction) => (
                        <TextCard
                          key={interaction.interactionId}
                          interaction={interaction}
                        />
                      ))}
                    </div>
                  );
                })()}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
