"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getDisplayName, getUserInitials } from "@/lib/user-utils";
import { QuestionCard, ProcedureCard, TextCard } from "../interaction-cards";
import type {
  TrainingAnalytics,
  ResolvedInteraction,
} from "@/types/training";

interface ParticipantRecordsProps {
  sessions: TrainingAnalytics[];
  uniqueUsers: Set<string>;
}

export function ParticipantRecords({
  sessions,
  uniqueUsers,
}: ParticipantRecordsProps) {
  const [selectedSession, setSelectedSession] = useState<TrainingAnalytics | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const showSessionDetails = (session: TrainingAnalytics) => {
    setSelectedSession(session);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Détail par participant</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            "image" in session.user
                              ? session.user.image || undefined
                              : undefined
                          }
                          alt={getDisplayName(session.user)}
                        />
                        <AvatarFallback>
                          {getUserInitials(session.user)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {getDisplayName(session.user)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {format(new Date(session.startTime), "dd/MM/yyyy", {
                        locale: fr,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(session.startTime), "HH:mm", {
                        locale: fr,
                      })}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      v{session.buildVersion || "1.0.0"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        session.score >= 80
                          ? "default"
                    : session.score >= 60
                    ? "secondary"
                    : "destructive"
                  }
                >
                  {Math.round(session.score)}%
                </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {Math.round(session.totalDuration / 60)} min
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.completionStatus === "COMPLETED" ? (
                      <Badge variant="default">Complété</Badge>
                    ) : session.completionStatus === "ABANDONED" ? (
                      <Badge variant="secondary">Abandonné</Badge>
                    ) : session.completionStatus === "IN_PROGRESS" ? (
                      <Badge variant="outline">En cours</Badge>
                    ) : (
                      <Badge variant="destructive">Échoué</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showSessionDetails(session)}
                    >
                      Voir détails
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog pour les détails de session */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Détails de la session</DialogTitle>
            <DialogDescription>
              {selectedSession && (
                <>
                  {selectedSession.displayName || selectedSession.buildName} •{" "}
                  {format(
                    new Date(selectedSession.startTime),
                    "dd/MM/yyyy HH:mm",
                    { locale: fr }
                  )}{" "}
                  • {getDisplayName(selectedSession.user)}
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
