import { useMemo } from "react";
import { useOrganizationStore } from "@/stores/organization-store";
import { useTrainingTags } from "./use-training-tags";
import { useMemberTags } from "./use-member-tags";
import { useMembers } from "../../hooks/use-members";

/**
 * Hook consolidé pour le système de gestion de formations
 * Combine et synchronise toutes les données du système
 */
export function useTrainingSystem() {
  const { activeOrganization } = useOrganizationStore();
  
  // Hooks de base
  const tagsQuery = useTrainingTags();
  const memberTagsQuery = useMemberTags();
  const membersQuery = useMembers();

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
    
    return tags.map(tag => {
      const tagAssignments = memberTags.filter(mt => mt.tagId === tag.id);
      const memberCount = tagAssignments.length;
      
      return {
        ...tag,
        memberCount,
        assignments: tagAssignments,
        isAssigned: memberCount > 0,
        // Calculer si le tag est en retard
        isOverdue: tag.dueDate ? new Date(tag.dueDate) < new Date() : false,
      };
    });
  }, [tagsQuery.data?.tags, memberTagsQuery.data?.memberTags]);

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
  const isLoading = tagsQuery.isLoading || memberTagsQuery.isLoading || membersQuery.isLoading;
  const isError = tagsQuery.isError || memberTagsQuery.isError || !!membersQuery.error;
  const error = tagsQuery.error?.message || (memberTagsQuery.error as Error)?.message || membersQuery.error;

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
    
    // Plans terminés (100% des membres ont terminé)
    const completedPlans = tagsWithStats.filter(tag => {
      if (tag.memberCount === 0) return false;
      // Pour l'instant on considère qu'aucun plan n'est terminé car pas encore de système de completion
      return false; // TODO: implémenter la logique de completion quand le système sera en place
    }).length;
    
    // Plans en retard (pas 100% terminé ET dépassement de due date)
    const overduePlans = tagsWithStats.filter(tag => {
      const isOverdue = tag.dueDate && new Date(tag.dueDate) < new Date();
      const hasMembers = tag.memberCount > 0;
      // Un plan est en retard s'il a une échéance passée ET qu'il a des membres assignés (donc pas terminé à 100%)
      return isOverdue && hasMembers;
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