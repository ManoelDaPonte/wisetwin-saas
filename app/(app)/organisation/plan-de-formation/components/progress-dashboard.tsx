"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { useTrainingDashboard } from "../hooks/use-training-system";
import { useBuildsWithTags } from "../hooks/use-build-tags";
import { useTrainingAnalytics } from "../hooks/use-training-analytics";
import { TagBadge } from "./tag-badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";
import type { TagWithStats } from "@/types/training";

interface ProgressDashboardProps {
  organizationId: string;
}

export function ProgressDashboard({}: ProgressDashboardProps) {
  const [selectedTagId, setSelectedTagId] = useState<string>("all");
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(
    new Set()
  );

  const {
    tagsWithStats,
    membersWithStats,
    dashboardMetrics,
    isLoading,
    getTagStats,
    refetch: refetchDashboard,
  } = useTrainingDashboard();

  // Hook pour obtenir les formations avec tags pour afficher les vraies formations
  const { data: buildsWithTags } = useBuildsWithTags();

  // Hook pour obtenir les analytics de formation (comme dans les statistiques)
  const {
    data: analyticsData,
    refetch: refetchAnalytics,
    isRefetching,
  } = useTrainingAnalytics({
    buildType: "WISETRAINER",
  });
  const analytics = analyticsData?.analytics || [];

  // Stats pour le tag sélectionné
  const selectedTagStats =
    selectedTagId === "all" ? null : getTagStats(selectedTagId);

  const selectedTag =
    selectedTagId === "all"
      ? null
      : tagsWithStats.find((t) => t.id === selectedTagId);

  const toggleMemberExpansion = (memberId: string) => {
    const newExpanded = new Set(expandedMembers);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    setExpandedMembers(newExpanded);
  };

  // Fonction helper pour vérifier si une formation est terminée par un membre spécifique
  const isFormationCompletedByMember = (
    buildName: string,
    memberId: string
  ) => {
    // Utiliser les analytics (comme dans les statistiques) au lieu de UserBuild
    const isCompleted = analytics.some(
      (analytic) =>
        analytic.user.id === memberId &&
        analytic.buildName === buildName &&
        analytic.completionStatus === "COMPLETED"
    );

    return isCompleted;
  };

  // Fonction helper pour calculer combien de formations d'un tag un membre a terminé
  const getMemberTagProgress = (memberId: string, tagId: string) => {
    const assignedBuilds =
      buildsWithTags?.filter((build) =>
        build.tags.some((tag) => tag.id === tagId)
      ) || [];

    const totalBuilds = assignedBuilds.length;
    const completedBuilds = assignedBuilds.filter((build) =>
      isFormationCompletedByMember(build.name, memberId)
    ).length;

    return {
      totalBuilds,
      completedBuilds,
      percentage:
        totalBuilds > 0 ? Math.round((completedBuilds / totalBuilds) * 100) : 0,
    };
  };

  // Fonction helper pour compter combien de membres ont terminé TOUTES les formations d'un tag
  const getTagCompletionCount = (tag: TagWithStats) => {
    const assignedBuilds =
      buildsWithTags?.filter((build) =>
        build.tags.some((t) => t.id === tag.id)
      ) || [];

    if (assignedBuilds.length === 0 || tag.memberCount === 0) {
      return 0;
    }

    // Récupérer les membres assignés à ce tag
    const memberIds = membersWithStats
      .filter((member) => member.assignedTags.some((t) => t.id === tag.id))
      .map((m) => m.id);

    // Compter combien de membres ont terminé TOUTES les formations
    const completedMembers = memberIds.filter((memberId) => {
      return assignedBuilds.every((build) =>
        isFormationCompletedByMember(build.name, memberId)
      );
    }).length;

    return completedMembers;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats générales skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="ml-4 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-12" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Section détails skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Détails du plan skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="ml-4 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Formations du plan skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des membres skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membre</TableHead>
                  <TableHead>Plans assignés</TableHead>
                  <TableHead>Progression</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats générales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Plans actifs
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {dashboardMetrics?.totalTags || 0}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {dashboardMetrics?.tagsWithMembers || 0} en cours
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Plans terminés
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {dashboardMetrics?.completedPlans || 0}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    100% terminé
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Plans en retard
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {dashboardMetrics?.overduePlans || 0}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    échéance dépassée
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation des plans */}
      <Card>
        {selectedTagId === "all" ? (
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Plans de formation</CardTitle>
                <CardDescription>
                  Cliquez sur un plan pour voir les détails et la progression
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {tagsWithStats.length} plan
                {tagsWithStats.length > 1 ? "s" : ""}
              </Badge>
            </div>
          </CardHeader>
        ) : (
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTagId("all")}
                  className="px-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div>
                    {selectedTag && (
                      <TagBadge
                        name={selectedTag.name}
                        color={selectedTag.color}
                      />
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchAnalytics();
                  refetchDashboard();
                }}
                disabled={isRefetching}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isRefetching ? "animate-spin" : ""
                  }`}
                />
                Actualiser
              </Button>
            </div>
          </CardHeader>
        )}
        <CardContent>
          {selectedTagId === "all" ? (
            // Vue d'ensemble de tous les plans
            <div className="space-y-4">
              {tagsWithStats.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucun plan de formation créé
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Créez votre premier tag dans l&apos;onglet &quot;Tags&quot;
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tagsWithStats.map((tag) => {
                    return (
                      <Card
                        key={tag.id}
                        className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4"
                        style={{
                          borderLeftColor: tag.color || "#3B82F6",
                        }}
                        onClick={() => setSelectedTagId(tag.id)}
                      >
                        <CardContent>
                          <div className="flex flex-col h-full space-y-4">
                            {/* En-tête avec nom et priorité */}
                            <div className="flex items-start justify-between">
                              <TagBadge name={tag.name} color={tag.color} />
                              <Badge
                                variant={
                                  tag.priority === "HIGH"
                                    ? "destructive"
                                    : tag.priority === "MEDIUM"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {tag.priority === "HIGH"
                                  ? "Élevée"
                                  : tag.priority === "MEDIUM"
                                  ? "Moyenne"
                                  : "Faible"}
                              </Badge>
                            </div>

                            {/* Description (toujours présente) */}
                            <div className="min-h-[2rem] flex items-start">
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {tag.description || "Aucune description"}
                              </p>
                            </div>

                            {/* Statistiques */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {tag.memberCount}
                                </span>
                                <span>
                                  membre
                                  {tag.memberCount > 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {getTagCompletionCount(tag)}/{tag.memberCount}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  terminés
                                </div>
                              </div>
                            </div>

                            {/* Échéance (toujours présente) */}
                            <div className="flex items-center justify-between pt-2 border-t mt-auto">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>Échéance</span>
                              </div>
                              {tag.dueDate ? (
                                <Badge
                                  variant={
                                    tag.isOverdue ? "destructive" : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {format(new Date(tag.dueDate), "dd/MM/yyyy", {
                                    locale: fr,
                                  })}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">
                                  Aucune
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // Détails du plan sélectionné
            selectedTag &&
            selectedTagStats && (
              <div className="space-y-6">
                {/* Métriques du plan */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-muted-foreground" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">
                            Terminés
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">
                              {getTagCompletionCount(selectedTag)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Clock className="h-8 w-8 text-muted-foreground" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">
                            En cours
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">
                              {selectedTagStats?.memberCount || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">
                            Échéance
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">
                              {selectedTag.dueDate
                                ? format(
                                    new Date(selectedTag.dueDate),
                                    "dd/MM/yyyy",
                                    {
                                      locale: fr,
                                    }
                                  )
                                : "Aucune"}
                            </p>
                            {selectedTag.dueDate && (
                              <Badge
                                variant={
                                  new Date(selectedTag.dueDate) < new Date()
                                    ? "destructive"
                                    : "outline"
                                }
                                className="text-xs"
                              >
                                {new Date(selectedTag.dueDate) < new Date()
                                  ? "en retard"
                                  : "à venir"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">
                            Priorité
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">
                              {selectedTag.priority === "HIGH"
                                ? "Élevée"
                                : selectedTag.priority === "MEDIUM"
                                ? "Moyenne"
                                : "Faible"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Liste des membres */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Membres assignés
                    </CardTitle>
                    <CardDescription>
                      Suivi individuel de la progression du plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]"></TableHead>
                          <TableHead>Membre</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Progression</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {membersWithStats
                          .filter((member) =>
                            member.assignedTags.some(
                              (tag) => tag.id === selectedTagId
                            )
                          )
                          .map((member) => (
                            <React.Fragment key={member.id}>
                              <TableRow
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => toggleMemberExpansion(member.id)}
                              >
                                <TableCell>
                                  {expandedMembers.has(member.id) ? (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                      {member.name?.[0] || member.email[0]}
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {member.name || "Sans nom"}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {member.email}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    En cours
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {(() => {
                                      const progress = getMemberTagProgress(
                                        member.id,
                                        selectedTagId
                                      );

                                      return (
                                        <>
                                          <span className="font-medium">
                                            {progress.percentage}%
                                          </span>
                                          <span className="text-muted-foreground ml-1">
                                            ({progress.completedBuilds}/
                                            {progress.totalBuilds} terminés)
                                          </span>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    <Bell className="w-3 h-3 mr-1 text-muted-foreground" />
                                    Rappel
                                  </Button>
                                </TableCell>
                              </TableRow>
                              {expandedMembers.has(member.id) && (
                                <TableRow key={`${member.id}-expanded`}>
                                  <TableCell
                                    colSpan={5}
                                    className="bg-muted/20"
                                  >
                                    <div className="py-4 space-y-3">
                                      {/* Formations réelles assignées à ce plan */}
                                      <div className="space-y-2">
                                        {(() => {
                                          // Si aucun plan n'est sélectionné, afficher toutes les formations du membre
                                          if (selectedTagId === "all") {
                                            // Récupérer toutes les formations assignées à ce membre via ses tags
                                            const memberAssignedBuilds =
                                              buildsWithTags?.filter((build) =>
                                                build.tags.some((tag) =>
                                                  member.assignedTags?.some(
                                                    (memberTag) =>
                                                      memberTag.id === tag.id
                                                  )
                                                )
                                              ) || [];

                                            if (
                                              memberAssignedBuilds.length === 0
                                            ) {
                                              return (
                                                <div className="text-center py-4">
                                                  <p className="text-sm text-muted-foreground">
                                                    Aucune formation assignée à
                                                    ce membre
                                                  </p>
                                                </div>
                                              );
                                            }

                                            return memberAssignedBuilds.map(
                                              (build) => {
                                                // Vérifier si cette formation est terminée par ce membre
                                                const isCompleted =
                                                  isFormationCompletedByMember(
                                                    build.name,
                                                    member.id
                                                  );

                                                return (
                                                  <div
                                                    key={build.name}
                                                    className="flex items-center justify-between p-2 bg-background rounded border"
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      {build.imageUrl ? (
                                                        <Image
                                                          src={build.imageUrl}
                                                          alt={build.name}
                                                          width={16}
                                                          height={16}
                                                          className="w-4 h-4 object-cover rounded"
                                                        />
                                                      ) : (
                                                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                                                      )}
                                                      <div>
                                                        <span className="text-sm font-medium">
                                                          {build.metadata
                                                            ?.title ||
                                                            build.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                          {build.type}
                                                        </span>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <Badge
                                                        variant={
                                                          isCompleted
                                                            ? "default"
                                                            : "secondary"
                                                        }
                                                        className="text-xs"
                                                      >
                                                        {isCompleted
                                                          ? "Terminé"
                                                          : "Non commencé"}
                                                      </Badge>
                                                    </div>
                                                  </div>
                                                );
                                              }
                                            );
                                          }

                                          // Sinon, afficher seulement les formations du plan sélectionné
                                          const assignedBuilds =
                                            buildsWithTags?.filter((build) =>
                                              build.tags.some(
                                                (tag) =>
                                                  tag.id === selectedTagId
                                              )
                                            ) || [];

                                          if (assignedBuilds.length === 0) {
                                            return (
                                              <div className="text-center py-4">
                                                <p className="text-sm text-muted-foreground">
                                                  Aucune formation assignée à ce
                                                  plan
                                                </p>
                                              </div>
                                            );
                                          }

                                          return assignedBuilds
                                            .map((build) => {
                                              // Vérifier si ce membre a ce tag assigné
                                              const memberHasThisTag =
                                                member.assignedTags?.some(
                                                  (memberTag) =>
                                                    build.tags.some(
                                                      (buildTag) =>
                                                        buildTag.id ===
                                                        memberTag.id
                                                    )
                                                );

                                              if (!memberHasThisTag) {
                                                return null; // Ne pas afficher cette formation pour ce membre
                                              }

                                              // Vérifier si cette formation est terminée par ce membre
                                              const isCompleted =
                                                isFormationCompletedByMember(
                                                  build.name,
                                                  member.id
                                                );

                                              return (
                                                <div
                                                  key={build.name}
                                                  className="flex items-center justify-between p-2 bg-background rounded border"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    {build.imageUrl ? (
                                                      <Image
                                                        src={build.imageUrl}
                                                        alt={build.name}
                                                        width={16}
                                                        height={16}
                                                        className="w-4 h-4 object-cover rounded"
                                                      />
                                                    ) : (
                                                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                                                    )}
                                                    <div>
                                                      <span className="text-sm font-medium">
                                                        {build.metadata
                                                          ?.title || build.name}
                                                      </span>
                                                      <span className="text-xs text-muted-foreground ml-2">
                                                        {build.type}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <Badge
                                                      variant={
                                                        isCompleted
                                                          ? "default"
                                                          : "secondary"
                                                      }
                                                      className="text-xs"
                                                    >
                                                      {isCompleted
                                                        ? "Terminé"
                                                        : "Non commencé"}
                                                    </Badge>
                                                  </div>
                                                </div>
                                              );
                                            })
                                            .filter(Boolean); // Enlever les null
                                        })()}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
