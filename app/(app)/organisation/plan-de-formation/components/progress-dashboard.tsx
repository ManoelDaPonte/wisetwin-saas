"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  Archive,
  ArchiveRestore,
  Trash2,
  CheckSquare,
  X,
  Loader2,
} from "lucide-react";
import { useTrainingDashboard } from "../hooks/use-training-system";
import { useBuildsWithTags } from "../hooks/use-build-tags";
import { useTrainingAnalytics } from "../hooks/use-training-analytics";
import { useTrainingReminders } from "../hooks/use-training-reminders";
import {
  useUpdateTrainingTag,
  useDeleteTrainingTag,
} from "../hooks/use-training-tags";
import { TagBadge } from "./tag-badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";
import type { TagWithStats } from "@/types/training";
import { useCurrentLanguage } from "@/stores/language-store";
import { getUserInitials, getDisplayName } from "@/lib/user-utils";
import { toast } from "sonner";

interface ProgressDashboardProps {
  organizationId: string;
}

export function ProgressDashboard({}: ProgressDashboardProps) {
  const currentLanguage = useCurrentLanguage();
  const [selectedTagId, setSelectedTagId] = useState<string>("all");
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(
    new Set()
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "completed" | "overdue" | "archived"
  >("all");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<null | "archive" | "delete">(
    null
  );

  // Hook pour les rappels
  const {
    sendIndividualReminder,
    sendTagReminder,
    isSendingIndividual,
    isSendingTag,
  } = useTrainingReminders();

  // Helper pour extraire le texte localisé des métadonnées
  const getLocalizedText = (
    text: string | { en: string; fr: string } | undefined
  ): string | undefined => {
    if (!text) return undefined;
    if (typeof text === "string") return text;
    return text[currentLanguage] || text.fr || text.en;
  };

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
  const { mutateAsync: updateTrainingTag } = useUpdateTrainingTag();
  const { mutateAsync: deleteTrainingTag } = useDeleteTrainingTag();

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

  const togglePlanSelection = (planId: string) => {
    setSelectedPlans((prev) => {
      const next = new Set(prev);
      if (next.has(planId)) {
        next.delete(planId);
      } else {
        next.add(planId);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedPlans(new Set());
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    clearSelection();
  };

  const startSelectionMode = () => {
    setSelectedTagId("all");
    setSelectionMode(true);
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

  // Fonction helper pour calculer les jours restants avant l'échéance
  const getDaysUntilDueDate = (dueDate: Date | null): number | null => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Fonction helper pour obtenir les styles d'urgence selon les jours restants
  const getUrgencyStyles = (daysRemaining: number | null, isCompleted: boolean, isArchived: boolean) => {
    // Pas d'urgence si le plan est terminé, archivé ou sans échéance
    if (isCompleted || isArchived || daysRemaining === null) {
      return {
        badge: null,
        cardClasses: "",
        shadowClasses: "",
      };
    }

    // Urgent : moins de 7 jours
    if (daysRemaining < 7 && daysRemaining >= 0) {
      return {
        badge: {
          label: "URGENT",
          variant: "destructive" as const,
          icon: AlertTriangle,
          animate: true,
        },
        cardClasses: "bg-destructive/5",
        shadowClasses: "shadow-lg shadow-destructive/20",
      };
    }

    // Bientôt : moins de 30 jours
    if (daysRemaining < 30 && daysRemaining >= 7) {
      return {
        badge: {
          label: "Bientôt",
          variant: "outline" as const,
          icon: Clock,
          animate: false,
          className: "border-amber-500 text-amber-700 dark:text-amber-400",
        },
        cardClasses: "bg-amber-500/5",
        shadowClasses: "shadow-md shadow-amber-500/10",
      };
    }

    // Retard
    if (daysRemaining < 0) {
      return {
        badge: null, // Le badge "En retard" existe déjà
        cardClasses: "",
        shadowClasses: "",
      };
    }

    return {
      badge: null,
      cardClasses: "",
      shadowClasses: "",
    };
  };

  // Filtrer les plans en fonction du statut sélectionné
  const filteredTags = tagsWithStats.filter((tag) => {
    if (tag.archived) {
      return statusFilter === "archived";
    }

    const completedCount = getTagCompletionCount(tag);
    const isCompleted =
      tag.memberCount > 0 && completedCount === tag.memberCount;
    const isOverdue = tag.isOverdue;
    const isActive = !isCompleted && !isOverdue;

    switch (statusFilter) {
      case "active":
        return isActive;
      case "completed":
        return isCompleted;
      case "overdue":
        return isOverdue && !isCompleted;
      case "archived":
        return false;
      default:
        return true;
    }
  });

  useEffect(() => {
    if (
      selectedTagId !== "all" &&
      !tagsWithStats.some((tag) => tag.id === selectedTagId)
    ) {
      setSelectedTagId("all");
    }
  }, [selectedTagId, tagsWithStats]);

  useEffect(() => {
    if (!selectionMode) {
      return;
    }

    setSelectedPlans((prev) => {
      const allowedIds = new Set(filteredTags.map((tag) => tag.id));
      const next = new Set(Array.from(prev).filter((id) => allowedIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [filteredTags, selectionMode]);

  useEffect(() => {
    if (selectionMode) {
      clearSelection();
    }
  }, [statusFilter, selectionMode]);

  const selectedPlanIds = Array.from(selectedPlans);
  const hasSelection = selectedPlanIds.length > 0;
  const allSelectedArchived =
    hasSelection &&
    selectedPlanIds.every((planId) =>
      tagsWithStats.some((tag) => tag.id === planId && tag.archived)
    );
  const archiveActionLabel = allSelectedArchived ? "Restaurer" : "Archiver";
  const isArchiving = bulkAction === "archive";
  const isDeleting = bulkAction === "delete";

  const handleArchiveSelected = async () => {
    if (!hasSelection) {
      return;
    }

    setBulkAction("archive");
    const targetArchived = allSelectedArchived ? false : true;
    try {
      await Promise.all(
        selectedPlanIds.map((planId) =>
          updateTrainingTag({
            tagId: planId,
            data: { archived: targetArchived },
          })
        )
      );
      toast.success(targetArchived ? "Plans archivés" : "Plans restaurés");
      refetchDashboard();
      refetchAnalytics();
      exitSelectionMode();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'archivage", error);
      toast.error(
        targetArchived
          ? "Impossible d'archiver les plans sélectionnés"
          : "Impossible de restaurer les plans sélectionnés"
      );
    } finally {
      setBulkAction(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (!hasSelection) {
      return;
    }

    setBulkAction("delete");
    try {
      await Promise.all(
        selectedPlanIds.map((planId) => deleteTrainingTag(planId))
      );
      toast.success("Plans supprimés");
      refetchDashboard();
      refetchAnalytics();
      exitSelectionMode();
    } catch (error) {
      console.error("Erreur lors de la suppression des plans", error);
      toast.error("Impossible de supprimer les plans sélectionnés");
    } finally {
      setBulkAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats générales skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Skeleton className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-12" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Plans actifs
                </p>
                <p className="text-2xl font-bold">
                  {dashboardMetrics?.activePlans || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Plans terminés
                </p>
                <p className="text-2xl font-bold">
                  {dashboardMetrics?.completedPlans || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Plans en retard
                </p>
                <p className="text-2xl font-bold">
                  {dashboardMetrics?.overduePlans || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Archive className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Plans archivés
                </p>
                <p className="text-2xl font-bold">
                  {dashboardMetrics?.archivedTags || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation des plans */}
      <Card>
        {selectedTagId === "all" ? (
          <CardHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectionMode ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exitSelectionMode}
                        disabled={isArchiving || isDeleting}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleArchiveSelected}
                        disabled={!hasSelection || isArchiving || isDeleting}
                        className="flex items-center gap-2"
                      >
                        {isArchiving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : allSelectedArchived ? (
                          <ArchiveRestore className="h-4 w-4" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                        {archiveActionLabel}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteSelected}
                        disabled={!hasSelection || isArchiving || isDeleting}
                        className="flex items-center gap-2"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Supprimer
                      </Button>
                      <Badge variant="secondary" className="text-xs">
                        {selectedPlans.size} sélectionné
                        {selectedPlans.size > 1 ? "s" : ""}
                      </Badge>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startSelectionMode}
                      className="flex items-center gap-2"
                      disabled={filteredTags.length === 0}
                    >
                      <CheckSquare className="h-4 w-4" />
                      Sélection
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter(
                        value as
                          | "all"
                          | "active"
                          | "completed"
                          | "overdue"
                          | "archived"
                      )
                    }
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="Filtrer par..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="active">En cours</SelectItem>
                      <SelectItem value="completed">Terminés</SelectItem>
                      <SelectItem value="overdue">En retard</SelectItem>
                      <SelectItem value="archived">Archivés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    sendTagReminder({ tagId: selectedTagId });
                  }}
                  disabled={isSendingTag}
                >
                  <Bell
                    className={`h-4 w-4 mr-2 ${
                      isSendingTag ? "animate-pulse" : ""
                    }`}
                  />
                  {isSendingTag ? "Envoi..." : "Rappeler tous"}
                </Button>
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
              ) : filteredTags.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucun plan ne correspond au filtre sélectionné
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Essayez de changer le filtre pour voir d&apos;autres plans
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredTags.map((tag) => {
                    const isSelected = selectedPlans.has(tag.id);
                    const completedMembers = getTagCompletionCount(tag);
                    const isCompleted =
                      tag.memberCount > 0 &&
                      completedMembers === tag.memberCount;

                    // Calculer l'urgence
                    const daysRemaining = getDaysUntilDueDate(tag.dueDate);
                    const urgencyStyles = getUrgencyStyles(daysRemaining, isCompleted, tag.archived);

                    const status = (() => {
                      if (tag.archived) {
                        return {
                          label: "Archivé",
                          variant: "outline" as const,
                        };
                      }
                      if (tag.isOverdue && !isCompleted) {
                        return {
                          label: "En retard",
                          variant: "destructive" as const,
                        };
                      }
                      if (isCompleted) {
                        return {
                          label: "Terminé",
                          variant: "default" as const,
                        };
                      }
                      return {
                        label: "En cours",
                        variant: "secondary" as const,
                      };
                    })();
                    const priorityLabel =
                      tag.priority === "HIGH"
                        ? "Élevée"
                        : tag.priority === "MEDIUM"
                        ? "Moyenne"
                        : "Faible";
                    const priorityVariant =
                      tag.priority === "HIGH"
                        ? "destructive"
                        : tag.priority === "MEDIUM"
                        ? "default"
                        : "secondary";
                    const dueDateVariant =
                      tag.archived || isCompleted
                        ? "outline"
                        : tag.isOverdue
                        ? "destructive"
                        : "outline";

                    return (
                      <Card
                        key={tag.id}
                        className={`relative transition-all duration-200 border-l-4 cursor-pointer ${
                          isSelected
                            ? "ring-2 ring-primary"
                            : selectionMode
                            ? "hover:ring-1 hover:ring-primary/40"
                            : "hover:shadow-md"
                        } ${tag.archived ? "opacity-60" : ""} ${urgencyStyles.cardClasses} ${urgencyStyles.shadowClasses}`}
                        style={{
                          borderLeftColor: tag.color || "#3B82F6",
                        }}
                        onClick={() => {
                          if (selectionMode) {
                            togglePlanSelection(tag.id);
                          } else {
                            setSelectedTagId(tag.id);
                          }
                        }}
                      >
                        {selectionMode && (
                          <div
                            className="absolute right-3 top-3 z-10"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                togglePlanSelection(tag.id)
                              }
                              aria-label={`Sélectionner ${tag.name}`}
                            />
                          </div>
                        )}
                        <CardContent>
                          <div className="flex flex-col h-full space-y-4">
                            {/* En-tête avec nom et badge d'urgence */}
                            <div className="flex items-start justify-between gap-2">
                              <TagBadge name={tag.name} color={tag.color} />
                              {/* Badge d'urgence si nécessaire */}
                              {urgencyStyles.badge && (
                                <Badge
                                  variant={urgencyStyles.badge.variant}
                                  className={`text-xs flex items-center gap-1 ${
                                    urgencyStyles.badge.animate ? "animate-pulse" : ""
                                  } ${urgencyStyles.badge.className || ""}`}
                                >
                                  <urgencyStyles.badge.icon className="h-3 w-3" />
                                  {urgencyStyles.badge.label}
                                </Badge>
                              )}
                            </div>

                            {/* Description (toujours présente) */}
                            <div className="min-h-[2rem] flex items-start">
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {tag.description || "Aucune description"}
                              </p>
                            </div>

                            {/* Statistiques avec progression */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {tag.memberCount} membre{tag.memberCount > 1 ? "s" : ""}
                                </span>
                                <span className="text-lg font-bold">
                                  {tag.memberCount > 0
                                    ? Math.round((completedMembers / tag.memberCount) * 100)
                                    : 0}%
                                </span>
                              </div>
                              <Progress
                                value={tag.memberCount > 0
                                  ? (completedMembers / tag.memberCount) * 100
                                  : 0
                                }
                                className="h-2"
                              />
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">
                                  {completedMembers}/{tag.memberCount} terminés
                                </div>
                                {/* Badge de statut */}
                                <Badge
                                  variant={status.variant}
                                  className="text-xs"
                                >
                                  {status.label}
                                </Badge>
                              </div>
                            </div>

                            {/* Échéance (toujours présente) */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t mt-auto">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>Échéance</span>
                                {tag.dueDate ? (
                                  <Badge
                                    variant={dueDateVariant}
                                    className="text-xs"
                                  >
                                    {format(
                                      new Date(tag.dueDate),
                                      "dd/MM/yyyy",
                                      {
                                        locale: fr,
                                      }
                                    )}
                                  </Badge>
                                ) : (
                                  <span className="italic">Aucune</span>
                                )}
                              </div>
                              <Badge
                                variant={priorityVariant}
                                className="text-xs"
                              >
                                {priorityLabel}
                              </Badge>
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
                              {(selectedTagStats?.memberCount || 0) -
                                getTagCompletionCount(selectedTag)}
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
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage
                                        src={member.avatarUrl || undefined}
                                      />
                                      <AvatarFallback>
                                        {getUserInitials(member)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">
                                        {getDisplayName(member)}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {member.email}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {(() => {
                                    const progress = getMemberTagProgress(
                                      member.id,
                                      selectedTagId
                                    );
                                    const isCompleted =
                                      progress.percentage === 100;

                                    return (
                                      <Badge
                                        variant={
                                          isCompleted ? "default" : "outline"
                                        }
                                        className="text-xs"
                                      >
                                        {isCompleted ? "Terminé" : "En cours"}
                                      </Badge>
                                    );
                                  })()}
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
                                      // Envoyer le rappel individuel
                                      sendIndividualReminder({
                                        memberId: member.id,
                                        tagId: selectedTagId,
                                      });
                                    }}
                                    disabled={
                                      isSendingIndividual ||
                                      selectedTagId === "all"
                                    }
                                  >
                                    <Bell className="w-3 h-3 mr-1 text-muted-foreground" />
                                    {isSendingIndividual
                                      ? "Envoi..."
                                      : "Rappel"}
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
                                                          {getLocalizedText(
                                                            build.metadata
                                                              ?.title
                                                          ) || build.name}
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
                                                        {getLocalizedText(
                                                          build.metadata?.title
                                                        ) || build.name}
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
