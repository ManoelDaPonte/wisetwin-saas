import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/stores/organization-store";
import { toast } from "sonner";

// === Types ===

interface SendIndividualReminderData {
  memberId: string;
  tagId: string;
}

interface SendTagReminderData {
  tagId: string;
}

interface SendBulkReminderData {
  confirmed?: boolean; // Pour s'assurer que l'utilisateur a confirmé
}

interface ReminderResponse {
  success: boolean;
  message: string;
  details?: {
    member?: string;
    plan?: string;
    progression?: string;
    totalMembers?: number;
    notified?: number;
    failed?: number;
    alreadyCompleted?: number;
    failedEmails?: Array<{ email: string; error: string }>;
  };
}

// === API Functions ===

async function sendIndividualReminder(
  data: SendIndividualReminderData,
  organizationId: string
): Promise<ReminderResponse> {
  const response = await fetch(`/api/training-management/reminders/individual?organizationId=${organizationId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'envoi du rappel");
  }

  return response.json();
}

async function sendTagReminder(
  data: SendTagReminderData,
  organizationId: string
): Promise<ReminderResponse> {
  const response = await fetch(`/api/training-management/reminders/tag?organizationId=${organizationId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'envoi des rappels");
  }

  return response.json();
}

async function sendBulkReminder(
  organizationId: string
): Promise<ReminderResponse> {
  const response = await fetch(`/api/training-management/reminders/bulk?organizationId=${organizationId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'envoi des rappels globaux");
  }

  return response.json();
}

// === Hooks ===

/**
 * Hook pour envoyer un rappel individuel à un membre pour un plan
 */
export function useSendIndividualReminder() {
  const { activeOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendIndividualReminderData) => {
      if (!activeOrganization) {
        throw new Error("Aucune organisation active");
      }
      return sendIndividualReminder(data, activeOrganization.id);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Rappel envoyé", {
          description: `Email envoyé à ${result.details?.member} pour le plan ${result.details?.plan}`,
        });

        // Invalider le cache si nécessaire
        if (activeOrganization) {
          queryClient.invalidateQueries({
            queryKey: ["training-dashboard", activeOrganization.id]
          });
        }
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("Prochain rappel possible dans")) {
        toast.warning("Rappel déjà envoyé", {
          description: error.message,
        });
      } else {
        toast.error("Erreur", {
          description: error.message,
        });
      }
    },
  });
}

/**
 * Hook pour envoyer un rappel à tous les membres d'un plan
 */
export function useSendTagReminder() {
  const { activeOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendTagReminderData) => {
      if (!activeOrganization) {
        throw new Error("Aucune organisation active");
      }
      return sendTagReminder(data, activeOrganization.id);
    },
    onSuccess: (result) => {
      if (result.success) {
        const details = result.details;

        if (details?.notified === 0 && details?.totalMembers > 0) {
          toast.info("Aucun rappel nécessaire", {
            description: "Tous les membres ont déjà terminé ce plan",
          });
        } else {
          toast.success("Rappels envoyés", {
            description: `${details?.notified || 0} membre(s) notifié(s) pour le plan ${details?.plan}`,
            action: details?.failed && details.failed > 0 ? {
              label: "Voir les échecs",
              onClick: () => {
                console.error("Emails en échec:", details.failedEmails);
                toast.error(`${details.failed} email(s) en échec`, {
                  description: "Consultez la console pour plus de détails",
                });
              }
            } : undefined,
          });
        }

        // Invalider le cache
        if (activeOrganization) {
          queryClient.invalidateQueries({
            queryKey: ["training-dashboard", activeOrganization.id]
          });
        }
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("Trop de membres")) {
        toast.error("Trop de membres", {
          description: error.message,
        });
      } else {
        toast.error("Erreur", {
          description: error.message,
        });
      }
    },
  });
}

/**
 * Hook pour envoyer un rappel global à tous les membres de tous les plans
 */
export function useSendBulkReminder() {
  const { activeOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: SendBulkReminderData) => {
      if (!activeOrganization) {
        throw new Error("Aucune organisation active");
      }

      // Vérifier que l'utilisateur a confirmé
      if (!data?.confirmed) {
        throw new Error("Veuillez confirmer l'envoi des rappels globaux");
      }

      return sendBulkReminder(activeOrganization.id);
    },
    onSuccess: (result) => {
      if (result.success) {
        const details = result.details;

        toast.success("Rappels globaux envoyés", {
          description: `${details?.notified || 0} membre(s) notifié(s) sur ${details?.totalMembers || 0}`,
          duration: 5000,
          action: {
            label: "Voir les détails",
            onClick: () => {
              const message = [
                `Plans: ${details?.totalPlans || 0}`,
                `Notifiés: ${details?.notified || 0}`,
                `Déjà terminés: ${details?.alreadyCompleted || 0}`,
                details?.failed ? `Échecs: ${details.failed}` : null,
              ].filter(Boolean).join(" | ");

              toast.info("Détails de l'envoi", {
                description: message,
                duration: 10000,
              });

              if (details?.failedEmails && details.failedEmails.length > 0) {
                console.error("Emails en échec:", details.failedEmails);
              }
            }
          },
        });

        // Invalider le cache
        if (activeOrganization) {
          queryClient.invalidateQueries({
            queryKey: ["training-dashboard", activeOrganization.id]
          });
          queryClient.invalidateQueries({
            queryKey: ["training-tags", activeOrganization.id]
          });
        }
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("Prochain rappel possible dans")) {
        toast.warning("Cooldown actif", {
          description: error.message,
          duration: 5000,
        });
      } else if (error.message.includes("Trop de membres")) {
        toast.error("Limite dépassée", {
          description: error.message,
          duration: 5000,
        });
      } else if (error.message.includes("confirmer")) {
        toast.error("Confirmation requise", {
          description: error.message,
        });
      } else {
        toast.error("Erreur", {
          description: error.message,
        });
      }
    },
  });
}

/**
 * Hook principal pour gérer tous les types de rappels
 */
export function useTrainingReminders() {
  const sendIndividual = useSendIndividualReminder();
  const sendTag = useSendTagReminder();
  const sendBulk = useSendBulkReminder();

  return {
    // Mutations
    sendIndividualReminder: sendIndividual.mutate,
    sendTagReminder: sendTag.mutate,
    sendBulkReminder: sendBulk.mutate,

    // Loading states
    isSendingIndividual: sendIndividual.isPending,
    isSendingTag: sendTag.isPending,
    isSendingBulk: sendBulk.isPending,
    isSending: sendIndividual.isPending || sendTag.isPending || sendBulk.isPending,

    // Success states
    individualSuccess: sendIndividual.isSuccess,
    tagSuccess: sendTag.isSuccess,
    bulkSuccess: sendBulk.isSuccess,

    // Error states
    individualError: sendIndividual.error,
    tagError: sendTag.error,
    bulkError: sendBulk.error,
  };
}