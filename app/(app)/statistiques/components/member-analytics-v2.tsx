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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useMembers } from "../../organisation/hooks/use-members";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getDisplayName, getUserInitials } from "@/lib/user-utils";
import type { TrainingAnalytics, AnalyticsSession, UserAnalyticsStats, QuestionInteractionData, ProcedureInteractionData, TextInteractionData } from "@/types/training";

interface MemberAnalyticsProps {
  organizationId: string;
  startDate?: string;
  endDate?: string;
  analytics: TrainingAnalytics[];
}

export function MemberAnalyticsV2({
  analytics,
}: MemberAnalyticsProps) {
  const [selectedSession, setSelectedSession] = useState<AnalyticsSession>({
    session: null,
    visible: false,
  });
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const { members, isLoading: membersLoading } = useMembers();

  // Grouper les analytics par utilisateur
  const analyticsByUser = React.useMemo(() => {
    const grouped = new Map<string, TrainingAnalytics[]>();

    analytics.forEach((session) => {
      const userId = session.user.id;
      if (!grouped.has(userId)) {
        grouped.set(userId, []);
      }
      grouped.get(userId)!.push(session);
    });

    return grouped;
  }, [analytics]);

  // Fonction pour afficher les détails d'une session
  const showSessionDetails = (session: TrainingAnalytics) => {
    setSelectedSession({ session, visible: true });
  };

  // Fonction pour basculer l'expansion d'un utilisateur
  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  // Calculer les stats pour un utilisateur
  const getUserStats = (userSessions: TrainingAnalytics[]): UserAnalyticsStats => {
    const totalSessions = userSessions.length;
    const completedSessions = userSessions.filter(
      (s) => s.completionStatus === "COMPLETED"
    ).length;
    const avgSuccessRate =
      userSessions.reduce((acc, s) => acc + s.successRate, 0) / totalSessions;
    const totalTime = userSessions.reduce((acc, s) => acc + s.totalDuration, 0);

    return {
      totalSessions,
      completedSessions,
      avgSuccessRate,
      totalTime,
    };
  };

  if (membersLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Résultats par utilisateur</CardTitle>
          <CardDescription>
            Cliquez sur &quot;Détails&quot; pour voir les réponses complètes de chaque
            session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Formations suivies</TableHead>
                <TableHead>Taux de réussite</TableHead>
                <TableHead>Temps total</TableHead>
                <TableHead>Dernière session</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(analyticsByUser.entries()).map(
                ([userId, userSessions]) => {
                  const user =
                    members?.find((m) => m.id === userId) ||
                    userSessions[0].user;
                  const stats = getUserStats(userSessions);
                  const lastSession = userSessions[0]; // Les sessions sont triées par date décroissante
                  const isExpanded = expandedUsers.has(userId);

                  return (
                    <React.Fragment key={userId}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/30"
                        onClick={() => toggleUserExpansion(userId)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleUserExpansion(userId);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={"image" in user ? user.image || undefined : undefined}
                                alt={getDisplayName(user)}
                              />
                              <AvatarFallback>
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {getDisplayName(user)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {stats.completedSessions} terminées
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              stats.avgSuccessRate >= 80
                                ? "default"
                                : stats.avgSuccessRate >= 60
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {stats.avgSuccessRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {Math.round(stats.totalTime / 60)} min
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {format(
                              new Date(lastSession.startTime),
                              "dd/MM/yyyy",
                              { locale: fr }
                            )}
                          </p>
                        </TableCell>
                      </TableRow>

                      {/* Sessions détaillées de l'utilisateur (affichées seulement si expandé) */}
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/30 p-2">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                Sessions détaillées:
                              </p>
                              {userSessions.map((session) => (
                                <div
                                  key={session.id}
                                  className="flex items-center justify-between p-3 bg-background rounded-lg border"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {session.buildName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(
                                        new Date(session.startTime),
                                        "dd/MM/yyyy HH:mm",
                                        { locale: fr }
                                      )}{" "}
                                      • Durée:{" "}
                                      {Math.round(session.totalDuration / 60)}{" "}
                                      min
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={
                                        session.completionStatus === "COMPLETED"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {session.completionStatus === "COMPLETED"
                                        ? "Terminé"
                                        : session.completionStatus ===
                                          "ABANDONED"
                                        ? "Abandonné"
                                        : session.completionStatus ===
                                          "IN_PROGRESS"
                                        ? "En cours"
                                        : "Échoué"}
                                    </Badge>
                                    <Badge
                                      variant={
                                        session.successRate >= 80
                                          ? "default"
                                          : session.successRate >= 60
                                          ? "secondary"
                                          : "destructive"
                                      }
                                      className="text-xs"
                                    >
                                      {session.successRate.toFixed(0)}%
                                    </Badge>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        showSessionDetails(session)
                                      }
                                    >
                                      Détails
                                      <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
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

          {analyticsByUser.size === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Aucune donnée pour cette période
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour les détails de session */}
      <Dialog
        open={selectedSession.visible}
        onOpenChange={(open) =>
          setSelectedSession({ ...selectedSession, visible: open })
        }
      >
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Détails de la session</DialogTitle>
            <DialogDescription>
              {selectedSession.session && (
                <>
                  {selectedSession.session.buildName} •
                  {format(
                    new Date(selectedSession.session.startTime),
                    "dd/MM/yyyy HH:mm",
                    { locale: fr }
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedSession.session && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                {/* Métriques globales de la session */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Durée totale
                        </p>
                        <p className="font-medium">
                          {Math.round(
                            selectedSession.session.totalDuration / 60
                          )}{" "}
                          min
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Interactions
                        </p>
                        <p className="font-medium">
                          {selectedSession.session.totalInteractions}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Taux de réussite
                        </p>
                        <p className="font-medium">
                          {selectedSession.session.successRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Statut</p>
                        <Badge
                          variant={
                            selectedSession.session.completionStatus ===
                            "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {selectedSession.session.completionStatus ===
                          "COMPLETED"
                            ? "Terminé"
                            : selectedSession.session.completionStatus ===
                              "ABANDONED"
                            ? "Abandonné"
                            : selectedSession.session.completionStatus ===
                              "IN_PROGRESS"
                            ? "En cours"
                            : "Échoué"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Détail de chaque interaction */}
                <div className="space-y-3">
                  <h3 className="font-medium">Détail des interactions</h3>
                  {selectedSession.session.interactions.map(
                    (interaction, index: number) => (
                      <Card key={interaction.interactionId}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <Badge variant="outline" className="mb-2">
                                {interaction.type === "question"
                                  ? "Question"
                                  : interaction.type === "procedure"
                                  ? "Procédure"
                                  : "Texte"}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                Interaction {index + 1} • Durée:{" "}
                                {Math.round(interaction.duration)} sec
                              </p>
                            </div>
                            {interaction.success ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                          </div>

                          {/* Détails spécifiques selon le type */}
                          {interaction.type === "question" &&
                            interaction.data && (() => {
                              const questionData = interaction.data as QuestionInteractionData;
                              return (
                              <div className="space-y-2">
                                <p className="font-medium text-sm">
                                  {questionData.questionText}
                                </p>

                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">
                                    Options:
                                  </p>
                                  {questionData.options?.map(
                                    (option: string, i: number) => {
                                      const isCorrect =
                                        questionData.correctAnswers?.includes(
                                          i
                                        );
                                      const isUserAnswer =
                                        questionData.userAnswers?.[0]?.includes(
                                          i
                                        );

                                      return (
                                        <div
                                          key={i}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          <div
                                            className={`w-4 h-4 rounded-full border ${
                                              isCorrect
                                                ? "bg-green-100 border-green-500"
                                                : isUserAnswer
                                                ? "bg-red-100 border-red-500"
                                                : "border-gray-300"
                                            }`}
                                          />
                                          <span
                                            className={
                                              isCorrect ? "font-medium" : ""
                                            }
                                          >
                                            {option}
                                          </span>
                                          {isCorrect && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              Correct
                                            </Badge>
                                          )}
                                          {isUserAnswer && !isCorrect && (
                                            <Badge
                                              variant="destructive"
                                              className="text-xs"
                                            >
                                              Choisi
                                            </Badge>
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>

                                <div className="flex items-center gap-4 pt-2 border-t">
                                  <p className="text-xs text-muted-foreground">
                                    Tentatives: {interaction.attempts}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Score final: {questionData.finalScore}%
                                  </p>
                                  {questionData.firstAttemptCorrect && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Réussi du premier coup
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              );
                            })()}

                          {interaction.type === "procedure" &&
                            interaction.data && (() => {
                              const procedureData = interaction.data as ProcedureInteractionData;
                              return (
                              <div className="space-y-2">
                                <p className="font-medium text-sm">
                                  {procedureData.instruction}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span>
                                    Étapes: {procedureData.stepNumber}/
                                    {procedureData.totalSteps}
                                  </span>
                                  <span>
                                    Indices utilisés:{" "}
                                    {procedureData.hintsUsed}
                                  </span>
                                  {procedureData.wrongClicks > 0 && (
                                    <span className="text-destructive">
                                      Clics erronés:{" "}
                                      {procedureData.wrongClicks}
                                    </span>
                                  )}
                                </div>
                              </div>
                              );
                            })()}

                          {interaction.type === "text" && interaction.data && (() => {
                            const textData = interaction.data as TextInteractionData;
                            return (
                            <div className="space-y-2">
                              <p className="text-sm line-clamp-3">
                                {textData.textContent}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                  Temps affiché:{" "}
                                  {Math.round(textData.timeDisplayed)}{" "}
                                  sec
                                </span>
                                <span>
                                  Lu complètement:{" "}
                                  {textData.readComplete
                                    ? "Oui"
                                    : "Non"}
                                </span>
                                <span>
                                  Scroll: {textData.scrollPercentage}%
                                </span>
                              </div>
                            </div>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
