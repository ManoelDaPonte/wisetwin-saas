"use client";

import React, { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronRight,
  ChevronDown,
  Clock,
  BarChart3,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getDisplayName, getUserInitials } from "@/lib/user-utils";
import { QuestionDistributionModal } from "./question-distribution-modal";
import type {
  TrainingAnalytics,
  TrainingStatsWithQuestions,
} from "@/types/training";

interface VersionRowProps {
  version: string;
  versionStats: TrainingStatsWithQuestions;
  trainingName: string;
  trainingDisplayName: string;
  trainingImageUrl?: string;
  onSessionClick: (session: TrainingAnalytics) => void;
}

export function VersionRow({
  version,
  versionStats,
  trainingName,
  trainingDisplayName,
  trainingImageUrl,
  onSessionClick,
}: VersionRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const displayName =
    versionStats.displayName || trainingDisplayName || trainingName;
  const coverImage = versionStats.imageUrl || trainingImageUrl;
  const participantCount =
    versionStats.uniqueUsersCount ?? versionStats.uniqueUsers.size;
  const toggleExpansion = () => setIsExpanded((prev) => !prev);
  const handleHeaderKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleExpansion();
    }
  };

  return (
    <>
      <div className="border rounded-lg p-4 bg-background flex flex-col gap-4">
        {/* En-tête de version */}
        <div
          role="button"
          tabIndex={0}
          onClick={toggleExpansion}
          onKeyDown={handleHeaderKeyDown}
          aria-expanded={isExpanded}
          className="flex items-center justify-between cursor-pointer select-none rounded-md py-1 transition-colors hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(event) => {
                event.stopPropagation();
                toggleExpansion();
              }}
              onKeyDown={(event) => event.stopPropagation()}
              aria-label={`Basculer la version ${version} de ${displayName}`}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {coverImage ? (
              <Image
                src={coverImage}
                alt={displayName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-md object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="text-sm font-mono">
                  v{version}
                </Badge>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {participantCount} participant
                    {participantCount > 1 ? "s" : ""}
                  </span>
                  <span>•</span>
                  <span>
                    {versionStats.sessions.length} session
                    {versionStats.sessions.length > 1 ? "s" : ""}
                  </span>
                  <span>•</span>
                  <Badge
                    variant={
                      versionStats.averageScore >= 80
                        ? "default"
                        : versionStats.averageScore >= 60
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {Math.round(versionStats.averageScore)}% score moyen
                  </Badge>
                </div>
              </div>
              {/* <p className="text-xs text-muted-foreground mt-1 truncate">
                {displayName}
              </p> */}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(true);
            }}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Voir statistiques
          </Button>
        </div>

        {/* Liste des participants (visible si expandé) */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Sessions des participants
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versionStats.sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage
                            src={
                              "image" in session.user
                                ? session.user.image || undefined
                                : undefined
                            }
                            alt={getDisplayName(session.user)}
                          />
                          <AvatarFallback className="text-xs">
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
                        {format(
                          new Date(session.startTime),
                          "dd/MM/yyyy HH:mm",
                          {
                            locale: fr,
                          }
                        )}
                      </p>
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
                        className="text-xs"
                      >
                        {Math.round(session.score)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {Math.round(session.totalDuration / 60)} min
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.completionStatus === "COMPLETED" ? (
                        <Badge variant="default" className="text-xs">
                          Complété
                        </Badge>
                      ) : session.completionStatus === "ABANDONED" ? (
                        <Badge variant="secondary" className="text-xs">
                          Abandonné
                        </Badge>
                      ) : session.completionStatus === "IN_PROGRESS" ? (
                        <Badge variant="outline" className="text-xs">
                          En cours
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Échoué
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSessionClick(session)}
                      >
                        Détails
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Modale des statistiques/histogrammes */}
      <QuestionDistributionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        trainingName={displayName}
        version={version}
        questions={versionStats.questionsArray || []}
        procedures={versionStats.proceduresArray}
        sessions={versionStats.sessions}
      />
    </>
  );
}
