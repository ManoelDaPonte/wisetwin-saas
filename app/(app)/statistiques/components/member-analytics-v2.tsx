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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type {
  TrainingAnalytics,
  AnalyticsSession,
  UserAnalyticsStats,
  QuestionInteractionData,
  ProcedureInteractionData,
} from "@/types/training";

interface MemberAnalyticsProps {
  organizationId: string;
  startDate?: string;
  endDate?: string;
  analytics: TrainingAnalytics[];
}

export function MemberAnalyticsV2({ analytics }: MemberAnalyticsProps) {
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
  const getUserStats = (
    userSessions: TrainingAnalytics[]
  ): UserAnalyticsStats => {
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
            Cliquez sur &quot;Détails&quot; pour voir les réponses complètes de
            chaque session
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
                                src={
                                  "image" in user
                                    ? user.image || undefined
                                    : undefined
                                }
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
                                      {session.buildVersion && (
                                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                                          v{session.buildVersion}
                                        </span>
                                      )}
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
        <DialogContent className="max-w-7xl max-h-[90vh]">
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
            <ScrollArea className="h-[75vh]">
              <div className="space-y-4 pr-4">
                {/* Métriques globales de la session */}
                <Card>
                  <CardContent className="p-4">
                    {/* Indicateur de version des données */}
                    {(() => {
                      const hasNewFormat = selectedSession.session.interactions.some(i =>
                        (i.type === "question" && i.subtype) ||
                        (i.type === "procedure" && i.data && (i.data as any).title)
                      );
                      if (!hasNewFormat) {
                        return (
                          <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              ⚠️ Session avec ancien format de données (format mis à jour disponible)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="min-h-[3.5rem] flex flex-col justify-between">
                        <p className="text-sm text-muted-foreground mb-1">
                          Durée
                        </p>
                        <p className="font-medium">
                          {Math.round(
                            selectedSession.session.totalDuration / 60
                          )}{" "}
                          min
                        </p>
                      </div>
                      <div className="min-h-[3.5rem] flex flex-col justify-between">
                        <p className="text-sm text-muted-foreground mb-1">
                          Interactions
                        </p>
                        <p className="font-medium">
                          {selectedSession.session.totalInteractions}
                        </p>
                      </div>
                      <div className="min-h-[3.5rem] flex flex-col justify-between">
                        <p className="text-sm text-muted-foreground mb-1">
                          Réussite
                        </p>
                        <p className="font-medium">
                          {selectedSession.session.successRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="min-h-[3.5rem] flex flex-col justify-between">
                        <p className="text-sm text-muted-foreground mb-1">
                          Statut
                        </p>
                        <Badge
                          variant={
                            selectedSession.session.completionStatus ===
                            "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                          className="self-start"
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

                {/* Procédures */}
                {(() => {
                  const procedures = selectedSession.session.interactions.filter(
                    i => i.type === "procedure"
                  );

                  if (procedures.length === 0) return null;

                  return (
                    <div className="space-y-4">
                      <h3 className="font-medium">Procédures ({procedures.length})</h3>
                      {procedures.map((interaction) => {
                        const procedureData = interaction.data as ProcedureInteractionData;
                        const isSuccess = interaction.success;

                        // Titre de la procédure
                        const title = procedureData.title ||
                          (procedureData.instruction
                            ? procedureData.instruction.substring(0, 100) + (procedureData.instruction.length > 100 ? "..." : "")
                            : "Procédure");

                        return (
                          <Card
                            key={interaction.interactionId}
                            className={isSuccess ? "border-green-500/30" : "border-red-500/30"}
                          >
                            <CardContent className="p-4">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-3 mb-4">
                                <p className="font-medium flex-1">
                                  {title}
                                </p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {Math.round(interaction.duration)}s
                                </span>
                              </div>

                              {/* Détails de la procédure */}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <span className="font-medium">Étape</span>
                                  <span className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                                    {procedureData.stepNumber}/{procedureData.totalSteps}
                                  </span>
                                </span>

                                {procedureData.hintsUsed > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5">
                                      <span>{procedureData.hintsUsed}</span>
                                      <span>indice{procedureData.hintsUsed > 1 ? 's' : ''}</span>
                                    </span>
                                  </>
                                )}

                                {procedureData.wrongClicks > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                                      <XCircle className="h-3 w-3" />
                                      <span>{procedureData.wrongClicks}</span>
                                      <span>erreur{procedureData.wrongClicks > 1 ? 's' : ''}</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Questions */}
                <div className="space-y-4">
                  <h3 className="font-medium">Questions ({selectedSession.session.interactions.filter(i => i.type === "question").length})</h3>
                  {selectedSession.session.interactions
                    .filter(i => i.type === "question")
                    .map((interaction) => {
                      const questionData = interaction.data as QuestionInteractionData;

                      // Gestion rétrocompatible pour déterminer le type de question
                      const isMultipleChoice =
                        interaction.subtype === "multiple_choice" ||
                        (!interaction.subtype && (
                          questionData.correctAnswers && questionData.correctAnswers.length > 1 ||
                          questionData.userAnswers?.some(answers => answers && answers.length > 1)
                        ));

                      // Critère de validation
                      const isValid = questionData.firstAttemptCorrect;
                      const userAnswers = questionData.userAnswers || [];

                      // Calculer les options choisies par l'utilisateur (toutes tentatives confondues)
                      const userSelectedOptions = new Set<number>();
                      userAnswers.forEach(attempt => {
                        attempt.forEach(optionIdx => userSelectedOptions.add(optionIdx));
                      });

                      return (
                        <Card key={interaction.interactionId} className={isValid ? "border-green-500/30" : "border-red-500/30"}>
                          <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <p className="font-medium flex-1">
                                {questionData.questionText}
                              </p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {Math.round(interaction.duration)}s
                              </span>
                            </div>

                            {/* Timeline des tentatives si multiple */}
                            {userAnswers.length > 1 && (
                              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Parcours ({userAnswers.length} tentative{userAnswers.length > 1 ? 's' : ''}) :
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {userAnswers.map((attempt, attemptIdx) => {
                                    const attemptCorrect =
                                      attempt.length === questionData.correctAnswers?.length &&
                                      attempt.every(a => questionData.correctAnswers?.includes(a));

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
                                            ? attempt.map(i => String.fromCharCode(65 + i)).join(", ")
                                            : "—"}
                                        </span>
                                        {attemptCorrect ? (
                                          <CheckCircle className="h-3 w-3" />
                                        ) : (
                                          <XCircle className="h-3 w-3" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Options */}
                            <div className="space-y-2">
                              {questionData.options?.map((option: string, i: number) => {
                                const isCorrect = questionData.correctAnswers?.includes(i);
                                const wasChosen = userSelectedOptions.has(i);

                                // Définir le style selon le statut de l'option
                                let bgClass = "";
                                let borderClass = "";
                                let iconBg = "";
                                let iconSymbol = "";
                                let badge = null;

                                if (isCorrect) {
                                  // Bonne réponse (toujours en vert)
                                  bgClass = "bg-green-50 dark:bg-green-950/20";
                                  borderClass = "border-green-200 dark:border-green-800";
                                  iconBg = "bg-green-500 border-green-500";
                                  iconSymbol = "✓";
                                  badge = (
                                    <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                                      Bonne réponse
                                    </Badge>
                                  );
                                } else if (wasChosen) {
                                  // Mauvaise réponse choisie par l'utilisateur (en rouge)
                                  bgClass = "bg-red-50 dark:bg-red-950/20";
                                  borderClass = "border-red-200 dark:border-red-800";
                                  iconBg = "bg-red-500 border-red-500";
                                  iconSymbol = "✗";
                                  badge = (
                                    <Badge variant="outline" className="text-xs border-red-500 text-red-700">
                                      Choisie
                                    </Badge>
                                  );
                                } else {
                                  // Option non choisie (style neutre/grisé)
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
                                          isMultipleChoice ? "rounded-sm" : "rounded-full"
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
                                      <p className={`text-sm ${isCorrect ? "font-medium" : ""} ${!isCorrect && !wasChosen ? "text-muted-foreground" : ""}`}>
                                        <span className="text-muted-foreground mr-2">
                                          {String.fromCharCode(65 + i)}.
                                        </span>
                                        {option}
                                      </p>
                                    </div>

                                    {badge}
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>

              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
