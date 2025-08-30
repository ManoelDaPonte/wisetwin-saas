import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/stores/organization-store";
import { 
  TrainingAssignment,
  TrainingAssignmentWithStats,
  CreateTrainingAssignmentData,
  UpdateTrainingAssignmentData,
  TrainingAssignmentsResponse,
  BulkCreateAssignmentsData 
} from "@/types/training";
import { toast } from "sonner";

// ===== FONCTIONS API =====

async function fetchTrainingAssignments(
  organizationId: string,
  options: {
    tagId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<TrainingAssignmentsResponse> {
  const searchParams = new URLSearchParams({
    organizationId,
    ...(options.tagId && { tagId: options.tagId }),
    ...(options.status && { status: options.status }),
    ...(options.limit && { limit: options.limit.toString() }),
    ...(options.offset && { offset: options.offset.toString() }),
  });

  const response = await fetch(`/api/training-management/assignments?${searchParams}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des assignments");
  }

  return response.json();
}

async function fetchTrainingAssignment(
  assignmentId: string,
  organizationId: string
): Promise<TrainingAssignmentWithStats> {
  const response = await fetch(
    `/api/training-management/assignments/${assignmentId}?organizationId=${organizationId}`
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération de l'assignment");
  }

  return response.json();
}

async function createTrainingAssignment(
  organizationId: string,
  data: CreateTrainingAssignmentData
): Promise<TrainingAssignment> {
  const response = await fetch(
    `/api/training-management/assignments?organizationId=${organizationId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la création de l'assignment");
  }

  return response.json();
}

async function createBulkAssignments(
  organizationId: string,
  data: BulkCreateAssignmentsData
): Promise<{ message: string; assignments: TrainingAssignment[]; createdCount: number }> {
  const response = await fetch(
    `/api/training-management/assignments?organizationId=${organizationId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la création des assignments");
  }

  return response.json();
}

async function updateTrainingAssignment(
  assignmentId: string,
  organizationId: string,
  data: UpdateTrainingAssignmentData
): Promise<TrainingAssignment> {
  const response = await fetch(
    `/api/training-management/assignments/${assignmentId}?organizationId=${organizationId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la mise à jour de l'assignment");
  }

  return response.json();
}

async function deleteTrainingAssignment(
  assignmentId: string,
  organizationId: string
): Promise<{ message: string }> {
  const response = await fetch(
    `/api/training-management/assignments/${assignmentId}?organizationId=${organizationId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression de l'assignment");
  }

  return response.json();
}

async function bulkUpdateAssignments(
  organizationId: string,
  data: { assignmentIds: string[]; updates: UpdateTrainingAssignmentData }
): Promise<{ message: string; updatedCount: number }> {
  const response = await fetch(
    `/api/training-management/assignments?organizationId=${organizationId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la mise à jour des assignments");
  }

  return response.json();
}

async function bulkDeleteAssignments(
  organizationId: string,
  assignmentIds: string[]
): Promise<{ message: string; deletedCount: number }> {
  const response = await fetch(
    `/api/training-management/assignments?organizationId=${organizationId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentIds }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression des assignments");
  }

  return response.json();
}

// ===== HOOKS DE BASE =====

export function useTrainingAssignments(options: {
  tagId?: string;
  status?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["training-assignments", activeOrganization?.id, options],
    queryFn: () => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return fetchTrainingAssignments(activeOrganization.id, options);
    },
    enabled: !!activeOrganization?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

export function useTrainingAssignment(assignmentId: string) {
  const { activeOrganization } = useOrganizationStore();

  return useQuery({
    queryKey: ["training-assignment", assignmentId, activeOrganization?.id],
    queryFn: () => {
      if (!activeOrganization?.id || !assignmentId) {
        throw new Error("Paramètres manquants");
      }
      return fetchTrainingAssignment(assignmentId, activeOrganization.id);
    },
    enabled: !!activeOrganization?.id && !!assignmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes (plus court car données plus volatiles)
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateTrainingAssignment() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (data: CreateTrainingAssignmentData) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return createTrainingAssignment(activeOrganization.id, data);
    },
    onSuccess: (_, variables) => {
      toast.success("Formation assignée au tag avec succès");
      
      // Invalider les caches pertinents
      queryClient.invalidateQueries({
        queryKey: ["training-assignments", activeOrganization?.id],
      });
      
      // Invalider aussi les tags pour mettre à jour les compteurs
      queryClient.invalidateQueries({
        queryKey: ["training-tags", activeOrganization?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCreateBulkAssignments() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (data: BulkCreateAssignmentsData) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return createBulkAssignments(activeOrganization.id, data);
    },
    onSuccess: (result) => {
      toast.success(`${result.createdCount} assignments créés avec succès`);
      
      // Invalider tous les caches pertinents
      queryClient.invalidateQueries({
        queryKey: ["training-assignments", activeOrganization?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["training-tags", activeOrganization?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTrainingAssignment() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: UpdateTrainingAssignmentData }) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return updateTrainingAssignment(assignmentId, activeOrganization.id, data);
    },
    onSuccess: (result, variables) => {
      toast.success("Assignment mis à jour avec succès");
      
      // Invalider les caches
      queryClient.invalidateQueries({
        queryKey: ["training-assignments", activeOrganization?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["training-assignment", variables.assignmentId, activeOrganization?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTrainingAssignment() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (assignmentId: string) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return deleteTrainingAssignment(assignmentId, activeOrganization.id);
    },
    onSuccess: (_, assignmentId) => {
      toast.success("Assignment supprimé avec succès");
      
      // Invalider les caches
      queryClient.invalidateQueries({
        queryKey: ["training-assignments", activeOrganization?.id],
      });
      queryClient.removeQueries({
        queryKey: ["training-assignment", assignmentId, activeOrganization?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkUpdateAssignments() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (data: { assignmentIds: string[]; updates: UpdateTrainingAssignmentData }) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return bulkUpdateAssignments(activeOrganization.id, data);
    },
    onSuccess: (result) => {
      toast.success(`${result.updatedCount} assignments mis à jour`);
      
      queryClient.invalidateQueries({
        queryKey: ["training-assignments", activeOrganization?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkDeleteAssignments() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganizationStore();

  return useMutation({
    mutationFn: (assignmentIds: string[]) => {
      if (!activeOrganization?.id) {
        throw new Error("Aucune organisation sélectionnée");
      }
      return bulkDeleteAssignments(activeOrganization.id, assignmentIds);
    },
    onSuccess: (result) => {
      toast.success(`${result.deletedCount} assignments supprimés`);
      
      queryClient.invalidateQueries({
        queryKey: ["training-assignments", activeOrganization?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}