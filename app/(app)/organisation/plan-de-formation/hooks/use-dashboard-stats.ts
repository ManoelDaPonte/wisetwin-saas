import { useQuery } from "@tanstack/react-query";
import { useOrganizationStore } from "@/stores/organization-store";
import { useTrainingTags } from "./use-training-tags";
import { useBuildTags, useBuildsWithTags } from "./use-build-tags";
import { useMemberTags } from "./use-member-tags";
import { useMembers } from "../../hooks/use-members";

interface TagCompletionStat {
  tagId: string;
  tagName: string;
  assignedMembers: number;
  completedMembers: number;
  completionRate: number;
  isOverdue: boolean;
}

interface DashboardStats {
  tags: {
    total: number;
    active: number;
    withMembers: number;
    withBuilds: number;
  };
  members: {
    total: number;
    withTags: number;
    withoutTags: number;
    averageTagsPerMember: number;
  };
  builds: {
    total: number;
    withTags: number;
    withoutTags: number;
    byType: {
      wisetour: number;
      wisetrainer: number;
    };
  };
  buildTags: {
    total: number;
    byPriority: {
      high: number;
      medium: number;
      low: number;
    };
    withDueDate: number;
    overdue: number;
  };
  completions: {
    total: number;
    completionRate: number;
    pending: number;
    avgCompletionTime: number; // en jours
    overdueCount: number;
    byTag: TagCompletionStat[]; // Détails par tag
  };
  trends: {
    tagsGrowth: number; // pourcentage de croissance sur 30j
    buildTagsGrowth: number;
    completionGrowth: number;
  };
}

export function useDashboardStats() {
  const { activeOrganization } = useOrganizationStore();
  
  // Récupération des données de base avec réutilisation des hooks existants
  const { data: tagsResponse } = useTrainingTags();
  const { data: buildTagsResponse } = useBuildTags();
  const { data: memberTagsResponse } = useMemberTags();
  const { data: buildsWithTags } = useBuildsWithTags();
  const membersQuery = useMembers();

  return useQuery({
    queryKey: ["dashboard-stats", activeOrganization?.id],
    queryFn: (): DashboardStats => {
      const tags = tagsResponse?.tags || [];
      const buildTags = buildTagsResponse?.buildTags || [];
      const memberTags = memberTagsResponse?.memberTags || [];
      const builds = buildsWithTags || [];
      const members = membersQuery.members || [];

      // Statistiques des tags
      const tagsStats = {
        total: tags.length,
        active: tags.length, // Tous les tags créés sont actifs par défaut
        withMembers: tags.filter(tag => (tag._count?.memberTags || 0) > 0).length,
        withBuilds: tags.filter(tag => 
          buildTags.some(bt => bt.tagId === tag.id)
        ).length,
      };

      // Statistiques des membres
      const membersWithTags = members.filter(member => 
        memberTags.some(mt => mt.userId === member.id)
      ).length;
      
      const totalTagAssignments = memberTags.length;
      const avgTagsPerMember = members.length > 0 
        ? Math.round((totalTagAssignments / members.length) * 100) / 100
        : 0;

      const membersStats = {
        total: members.length,
        withTags: membersWithTags,
        withoutTags: members.length - membersWithTags,
        averageTagsPerMember: avgTagsPerMember,
      };

      // Statistiques des builds
      const buildsWithTagsCount = builds.filter(build => build.tags.length > 0).length;
      const wisetourCount = builds.filter(build => build.type === "WISETOUR").length;
      const wisetrainerCount = builds.filter(build => build.type === "WISETRAINER").length;

      const buildsStats = {
        total: builds.length,
        withTags: buildsWithTagsCount,
        withoutTags: builds.length - buildsWithTagsCount,
        byType: {
          wisetour: wisetourCount,
          wisetrainer: wisetrainerCount,
        },
      };

      // Statistiques des tags (priority et dueDate sont maintenant au niveau des tags)
      const highPriority = tags.filter(t => t.priority === "HIGH").length;
      const mediumPriority = tags.filter(t => t.priority === "MEDIUM").length;
      const lowPriority = tags.filter(t => t.priority === "LOW").length;

      const withDueDate = tags.filter(t => t.dueDate).length;
      const now = new Date();
      const overdue = tags.filter(t => 
        t.dueDate && new Date(t.dueDate) < now
      ).length;

      const buildTagsStats = {
        total: buildTags.length, // Nombre total d'associations formation-tag
        byPriority: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority,
        },
        withDueDate,
        overdue,
      };

      // Statistiques de complétion par tag (nouvelle logique)
      const tagCompletionStats = tags.map(tag => {
        // Membres assignés à ce tag
        const assignedMembers = tag._count?.memberTags || 0;
        
        // Formations assignées à ce tag
        const tagBuilds = buildTags.filter(bt => bt.tagId === tag.id);
        const totalFormations = tagBuilds.length;
        
        if (assignedMembers === 0 || totalFormations === 0) {
          return {
            tagId: tag.id,
            tagName: tag.name,
            assignedMembers: 0,
            completedMembers: 0,
            completionRate: 0,
            isOverdue: tag.dueDate ? new Date(tag.dueDate) < new Date() : false,
          };
        }

        // Calculer combien de membres ont terminé TOUTES les formations du tag
        // Pour simplifier pour l'instant, on utilise l'approximation suivante:
        // Si un membre a des completions pour toutes les formations du tag, il a terminé
        const completedMembers = Math.floor(
          tagBuilds.reduce((sum, bt) => sum + (bt._count?.completions || 0), 0) / totalFormations
        );
        
        const completionRate = assignedMembers > 0 
          ? Math.round((completedMembers / assignedMembers) * 100) 
          : 0;

        return {
          tagId: tag.id,
          tagName: tag.name,
          assignedMembers,
          completedMembers,
          completionRate,
          isOverdue: tag.dueDate ? new Date(tag.dueDate) < new Date() : false,
        };
      });

      // Statistiques globales agrégées
      const totalTagMembers = tagCompletionStats.reduce((sum, ts) => sum + ts.assignedMembers, 0);
      const totalTagCompletedMembers = tagCompletionStats.reduce((sum, ts) => sum + ts.completedMembers, 0);
      const overdueTagsCount = tagCompletionStats.filter(ts => ts.isOverdue).length;
      
      const completionsStats = {
        total: totalTagCompletedMembers,
        completionRate: totalTagMembers > 0 ? Math.round((totalTagCompletedMembers / totalTagMembers) * 100) : 0,
        pending: totalTagMembers - totalTagCompletedMembers,
        avgCompletionTime: 0, // À implémenter plus tard avec les données de completion
        overdueCount: overdueTagsCount,
        byTag: tagCompletionStats, // Détails par tag
      };

      // Tendances (simulées pour l'instant)
      const trendsStats = {
        tagsGrowth: 0, // À implémenter avec des données historiques
        buildTagsGrowth: 0,
        completionGrowth: 0,
      };

      return {
        tags: tagsStats,
        members: membersStats,
        builds: buildsStats,
        buildTags: buildTagsStats,
        completions: completionsStats,
        trends: trendsStats,
      };
    },
    enabled: !!activeOrganization?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes (données volatiles)
    gcTime: 5 * 60 * 1000,    // 5 minutes
  });
}

// Hook pour les métriques en temps réel
export function useRealtimeMetrics() {
  const dashboardStats = useDashboardStats();
  
  return {
    ...dashboardStats,
    // Métriques calculées
    metrics: dashboardStats.data ? {
      tagUtilizationRate: dashboardStats.data.tags.total > 0 
        ? Math.round((dashboardStats.data.tags.withMembers / dashboardStats.data.tags.total) * 100)
        : 0,
      
      buildCoverageRate: dashboardStats.data.tags.total > 0
        ? Math.round((dashboardStats.data.tags.withBuilds / dashboardStats.data.tags.total) * 100)
        : 0,
      
      memberEngagementRate: dashboardStats.data.members.total > 0
        ? Math.round((dashboardStats.data.members.withTags / dashboardStats.data.members.total) * 100)
        : 0,
      
      buildEngagementRate: dashboardStats.data.builds.total > 0
        ? Math.round((dashboardStats.data.builds.withTags / dashboardStats.data.builds.total) * 100)
        : 0,
      
      criticalAssignmentsRate: dashboardStats.data.buildTags.total > 0
        ? Math.round((dashboardStats.data.buildTags.overdue / dashboardStats.data.buildTags.total) * 100)
        : 0,
    } : null,
  };
}