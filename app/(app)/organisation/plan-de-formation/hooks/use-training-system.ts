import { useMemo } from "react";
import { useOrganizationStore } from "@/stores/organization-store";
import { useTrainingTags } from "./use-training-tags";
import { useMemberTags } from "./use-member-tags";
import { useMembers } from "../../hooks/use-members";
import { useBuildTags } from "./use-build-tags";
import { useTrainingCompletions } from "./use-training-completions";

/**
 * Hook consolidé pour le système de gestion de formations
 * Combine et synchronise toutes les données du système
 */
export function useTrainingSystem() {
  const { activeOrganization } = useOrganizationStore();

  // Hooks de base
  const tagsQuery = useTrainingTags();
  const memberTagsQuery = useMemberTags();
  const buildTagsQuery = useBuildTags();
  const membersQuery = useMembers();
  const completionsQuery = useTrainingCompletions();

  // Permissions
  const canManage = activeOrganization?.role === "OWNER" || activeOrganization?.role === "ADMIN";
  const canDelete = activeOrganization?.role === "OWNER";

  // Données enrichies avec statistiques
  const systemStats = useMemo(() => {
    const tags = tagsQuery.data?.tags || [];
    const memberTags = memberTagsQuery.data?.memberTags || [];
    const members = membersQuery.members || [];

    return {
      totalTags: tags.length,
      totalMembers: members.length,
      totalAssignments: memberTags.length,
      averageTagsPerMember: members.length > 0 ? memberTags.length / members.length : 0,
      tagsWithMembers: tags.filter(tag =>
        memberTags.some(mt => mt.tagId === tag.id)
      ).length,
      membersWithTags: members.filter(member =>
        memberTags.some(mt => mt.userId === member.id)
      ).length,
    };
  }, [tagsQuery.data?.tags, memberTagsQuery.data?.memberTags, membersQuery.members]);

  // Tags avec statistiques détaillées
  const tagsWithStats = useMemo(() => {
    const tags = tagsQuery.data?.tags || [];
    const memberTags = memberTagsQuery.data?.memberTags || [];
    const buildTags = buildTagsQuery.data?.buildTags || [];
    const completionMap = completionsQuery.data?.completionMap || new Map();

    return tags.map(tag => {
      const tagAssignments = memberTags.filter(mt => mt.tagId === tag.id);
      const memberCount = tagAssignments.length;

      // Récupérer les buildTags pour ce tag
      const tagBuildTags = buildTags.filter(bt => bt.tagId === tag.id);
      const buildCount = tagBuildTags.length;

      // Calculer les completions réelles via TrainingAnalytics
      let totalCompletions = 0;

      // Pour chaque formation du tag
      tagBuildTags.forEach(buildTag => {
        const completedUserIds = completionMap.get(buildTag.buildName) || new Set();

        // Pour chaque membre assigné au tag
        tagAssignments.forEach(assignment => {
          // Si le membre a complété cette formation, incrémenter
          if (completedUserIds.has(assignment.userId)) {
            totalCompletions++;
          }
        });
      });

      // Un plan est terminé si : memberCount > 0 ET buildCount > 0 ET totalCompletions === (memberCount * buildCount)
      const expectedCompletions = memberCount * buildCount;
      const isCompleted = memberCount > 0 && buildCount > 0 && totalCompletions === expectedCompletions;
      const completionRate = expectedCompletions > 0 ? (totalCompletions / expectedCompletions) * 100 : 0;

      return {
        ...tag,
        memberCount,
        assignments: tagAssignments,
        isAssigned: memberCount > 0,
        // Stats de completion
        buildCount,
        totalCompletions,
        expectedCompletions,
        isCompleted,
        completionRate,
        // Calculer si le tag est en retard
        isOverdue: tag.dueDate ? new Date(tag.dueDate) < new Date() : false,
      };
    });
  }, [tagsQuery.data?.tags, memberTagsQuery.data?.memberTags, buildTagsQuery.data?.buildTags, completionsQuery.data?.completionMap]);

  // Membres avec statistiques détaillées
  const membersWithStats = useMemo(() => {
    const members = membersQuery.members || [];
    const memberTags = memberTagsQuery.data?.memberTags || [];
    const tags = tagsQuery.data?.tags || [];
    
    return members.map(member => {
      const memberAssignments = memberTags.filter(mt => mt.userId === member.id);
      const memberTagIds = memberAssignments.map(mt => mt.tagId);
      const assignedTags = tags.filter(tag => memberTagIds.includes(tag.id));
      
      // Calculer les échéances
      const tagsWithDueDate = assignedTags.filter(tag => tag.dueDate);
      const overdueTags = tagsWithDueDate.filter(tag => 
        new Date(tag.dueDate!) < new Date()
      );
      
      return {
        ...member,
        assignedTags,
        totalAssignments: memberAssignments.length,
        tagsWithDueDate: tagsWithDueDate.length,
        overdueTags: overdueTags.length,
        hasOverdue: overdueTags.length > 0,
        nextDueDate: tagsWithDueDate
          .map(tag => new Date(tag.dueDate!))
          .filter(date => date > new Date())
          .sort()[0] || null,
      };
    });
  }, [membersQuery.members, memberTagsQuery.data?.memberTags, tagsQuery.data?.tags]);

  // État de chargement global
  const isLoading = tagsQuery.isLoading || memberTagsQuery.isLoading || membersQuery.isLoading || completionsQuery.isLoading;
  const isError = tagsQuery.isError || memberTagsQuery.isError || !!membersQuery.error || completionsQuery.isError;
  const error = tagsQuery.error?.message || (memberTagsQuery.error as Error)?.message || membersQuery.error || (completionsQuery.error as Error)?.message;

  return {
    // Données de base
    tags: tagsQuery.data?.tags || [],
    members: membersQuery.members || [],
    memberTags: memberTagsQuery.data?.memberTags || [],
    
    // Données enrichies
    tagsWithStats,
    membersWithStats,
    systemStats,
    
    // États
    isLoading,
    isError,
    error,
    
    // Permissions
    canManage,
    canDelete,
    
    // Utilitaires
    refetch: () => {
      tagsQuery.refetch();
      memberTagsQuery.refetch();
      membersQuery.fetchMembers();
      completionsQuery.refetch();
    },
    
    // Helpers pour l'analyse
    getTagById: (tagId: string) => tagsQuery.data?.tags.find(tag => tag.id === tagId),
    getMemberById: (memberId: string) => membersQuery.members?.find(member => member.id === memberId),
    getTagMembers: (tagId: string) => memberTagsQuery.data?.memberTags.filter(mt => mt.tagId === tagId) || [],
    getMemberTags: (memberId: string) => memberTagsQuery.data?.memberTags.filter(mt => mt.userId === memberId) || [],
    
    // Statistiques par tag
    getTagStats: (tagId: string) => {
      const tagAssignments = memberTagsQuery.data?.memberTags.filter(mt => mt.tagId === tagId) || [];
      return {
        memberCount: tagAssignments.length,
        assignments: tagAssignments,
      };
    },
    
    // Statistiques par membre
    getMemberStats: (memberId: string) => {
      const memberAssignments = memberTagsQuery.data?.memberTags.filter(mt => mt.userId === memberId) || [];
      const tags = tagsQuery.data?.tags || [];
      const memberTagIds = memberAssignments.map(mt => mt.tagId);
      const assignedTags = tags.filter(tag => memberTagIds.includes(tag.id));
      const overdueTags = assignedTags.filter(tag => 
        tag.dueDate && new Date(tag.dueDate) < new Date()
      );
      
      return {
        totalTags: memberAssignments.length,
        assignedTags,
        overdueTags: overdueTags.length,
        hasOverdue: overdueTags.length > 0,
      };
    },
  };
}

/**
 * Hook simplifié pour l'aperçu du dashboard
 */
export function useTrainingDashboard() {
  const trainingSystem = useTrainingSystem();
  
  // Métriques principales pour le dashboard
  const dashboardMetrics = useMemo(() => {
    const { systemStats, tagsWithStats, membersWithStats } = trainingSystem;
    
    // Tags par priorité
    const priorityBreakdown = {
      high: tagsWithStats.filter(tag => tag.priority === "HIGH").length,
      medium: tagsWithStats.filter(tag => tag.priority === "MEDIUM").length,
      low: tagsWithStats.filter(tag => tag.priority === "LOW").length,
    };
    
    // Plans actifs (pas terminés ET échéance pas dépassée)
    const activePlans = tagsWithStats.filter(tag => {
      const notCompleted = !tag.isCompleted;
      const notOverdue = !tag.dueDate || new Date(tag.dueDate) >= new Date();
      // Un plan est actif s'il n'est pas terminé ET (pas d'échéance OU échéance pas encore dépassée)
      return notCompleted && notOverdue;
    }).length;

    // Plans terminés (100% des membres ont terminé toutes les formations)
    const completedPlans = tagsWithStats.filter(tag => tag.isCompleted).length;

    // Plans en retard (pas 100% terminé ET dépassement de due date)
    const overduePlans = tagsWithStats.filter(tag => {
      const isOverdue = tag.dueDate && new Date(tag.dueDate) < new Date();
      const notCompleted = !tag.isCompleted;
      // Un plan est en retard s'il a une échéance passée ET qu'il n'est pas terminé
      return isOverdue && notCompleted;
    }).length;
    
    // Membres avec des tags en retard
    const membersWithOverdue = membersWithStats.filter(member => member.hasOverdue).length;
    
    // Prochaines échéances (7 prochains jours)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingDeadlines = tagsWithStats.filter(tag => 
      tag.dueDate && 
      new Date(tag.dueDate) > new Date() && 
      new Date(tag.dueDate) <= nextWeek
    ).length;
    
    return {
      ...systemStats,
      priorityBreakdown,
      activePlans,
      completedPlans,
      overduePlans,
      membersWithOverdue,
      upcomingDeadlines,
    };
  }, [trainingSystem]);
  
  return {
    ...trainingSystem,
    dashboardMetrics,
  };
}