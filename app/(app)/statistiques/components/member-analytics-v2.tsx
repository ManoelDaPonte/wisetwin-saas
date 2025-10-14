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
} from "lucide-react";
import { useMembers } from "../../organisation/hooks/use-members";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getDisplayName, getUserInitials } from "@/lib/user-utils";
import { QuestionCard, ProcedureCard, TextCard } from "./interaction-cards";
import type {
  TrainingAnalytics,
  AnalyticsSession,
  UserAnalyticsStats,
  ResolvedInteraction,
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
    const avgScore =
      userSessions.reduce((acc, s) => acc + s.score, 0) / totalSessions;
    const totalTime = userSessions.reduce((acc, s) => acc + s.totalDuration, 0);

    return {
      totalSessions,
      completedSessions,
      avgScore,
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
                              stats.avgScore >= 80
                                ? "default"
                                : stats.avgScore >= 60
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {Math.round(stats.avgScore)}%
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
                                      {session.displayName || session.buildName}
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
                                        session.score >= 80
                                          ? "default"
                                          : session.score >= 60
                                          ? "secondary"
                                          : "destructive"
                                      }
                                      className="text-xs"
                                    >
                                      {Math.round(session.score)}%
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
                  {selectedSession.session.displayName ||
                    selectedSession.session.buildName}{" "}
                  •{" "}
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
                {/* Procédures */}
                {(() => {
                  const procedures = selectedSession.session.interactions.filter(
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
                  const questions = selectedSession.session.interactions.filter(
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
                  const texts = selectedSession.session.interactions.filter(
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
