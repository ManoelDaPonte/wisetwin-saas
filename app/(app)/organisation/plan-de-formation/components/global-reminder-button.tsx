"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BellRing,
  AlertTriangle,
  Users,
  BookOpen,
  Loader2,
  Mail,
} from "lucide-react";
import { useTrainingReminders } from "../hooks/use-training-reminders";
import { useTrainingDashboard } from "../hooks/use-training-system";
import { useOrganizationStore } from "@/stores/organization-store";
import { toast } from "sonner";

export function GlobalReminderButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { activeOrganization } = useOrganizationStore();
  const { sendBulkReminder, isSendingBulk } = useTrainingReminders();

  // Récupérer les statistiques globales
  const { tagsWithStats, membersWithStats, isLoading } =
    useTrainingDashboard();

  // Calculer les statistiques pour l'affichage
  // Un plan actif est : pas terminé ET (pas d'échéance OU échéance pas encore dépassée) ET avec des membres
  const activePlans = tagsWithStats.filter((tag) => {
    const notCompleted = !tag.isCompleted;
    const notOverdue = !tag.dueDate || new Date(tag.dueDate) >= new Date();
    const hasMembers = tag.memberCount > 0;
    return notCompleted && notOverdue && hasMembers;
  });
  const totalMembers = new Set(membersWithStats.map((m) => m.id)).size;
  const membersWithIncompletePlans = membersWithStats.filter((member) => {
    // Vérifier si le membre a au moins un plan non terminé
    return member.assignedTags.some((tag) => {
      const tagData = tagsWithStats.find((t) => t.id === tag.id);
      return tagData && tagData.completionRate < 100;
    });
  }).length;

  // Vérifier les permissions
  const canSendReminders =
    activeOrganization?.role === "OWNER" ||
    activeOrganization?.role === "ADMIN";

  if (!canSendReminders) {
    return null; // Ne pas afficher le bouton si l'utilisateur n'a pas les permissions
  }

  const handleSendReminders = () => {
    if (!isConfirmed) {
      toast.error("Veuillez confirmer l'envoi");
      return;
    }

    sendBulkReminder(
      { confirmed: true },
      {
        onSuccess: () => {
          setIsOpen(false);
          setIsConfirmed(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Chargement...
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative"
          disabled={
            activePlans.length === 0 || membersWithIncompletePlans === 0
          }
        >
          <BellRing className="w-4 h-4 mr-2" />
          Rappel global
          {activePlans.length > 0 && (
            <Badge variant="secondary" className="ml-2 px-1.5 py-0 h-5 text-xs">
              {activePlans.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-primary" />
            Envoi de rappels globaux
          </DialogTitle>
          <DialogDescription>
            Envoyez un email de rappel à tous les membres ayant des plans de formation en cours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statistiques */}
          <div>
            <h3 className="text-sm font-medium mb-3">Impact de l&apos;envoi</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-card p-3 flex items-center gap-2.5">
                <div className="rounded bg-muted p-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Plans actifs</p>
                  <p className="text-xl font-bold">{activePlans.length}</p>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-3 flex items-center gap-2.5">
                <div className="rounded bg-muted p-1.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Membres</p>
                  <p className="text-xl font-bold">
                    {membersWithIncompletePlans}
                    <span className="text-xs text-muted-foreground font-normal ml-1">/ {totalMembers}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-3 flex items-center gap-2.5">
                <div className="rounded bg-primary/10 p-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Emails</p>
                  <p className="text-xl font-bold text-primary">
                    {membersWithIncompletePlans}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Avertissements */}
          <div className="rounded-lg border border-orange-200 bg-orange-50/30 dark:bg-orange-950/10 dark:border-orange-900/30 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-orange-100 dark:bg-orange-950/50 p-2 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-500" />
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Points d&apos;attention
                </h3>
                <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 dark:text-orange-400 mt-0.5">•</span>
                    <span>
                      Chaque membre recevra un seul email récapitulant tous ses
                      plans en cours
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 dark:text-orange-400 mt-0.5">•</span>
                    <span>
                      Les membres ayant terminé tous leurs plans ne seront pas
                      notifiés
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 dark:text-orange-400 mt-0.5">•</span>
                    <span>
                      Un délai de 48 heures sera appliqué avant le prochain rappel
                      global
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 dark:text-orange-400 mt-0.5">•</span>
                    <span>
                      L&apos;envoi peut prendre quelques minutes selon le nombre
                      de destinataires
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className="flex items-start space-x-3 rounded-lg border p-4 bg-background">
            <Checkbox
              id="confirm"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label
                htmlFor="confirm"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Je confirme vouloir envoyer ces rappels
              </Label>
              <p className="text-xs text-muted-foreground">
                Je comprends que {membersWithIncompletePlans} membre
                {membersWithIncompletePlans > 1 ? "s" : ""}{" "}
                {membersWithIncompletePlans > 1 ? "vont" : "va"} recevoir un
                email de rappel concernant{" "}
                {membersWithIncompletePlans > 1 ? "leurs" : "ses"} plans de
                formation en cours.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSendingBulk}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSendReminders}
            disabled={!isConfirmed || isSendingBulk}
          >
            {isSendingBulk ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <BellRing className="w-4 h-4 mr-2" />
                Envoyer {membersWithIncompletePlans} rappel{membersWithIncompletePlans > 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
