"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BellRing,
  AlertTriangle,
  Users,
  BookOpen,
  Loader2,
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
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
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
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Envoi de rappels globaux
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action enverra des emails de rappel à tous les membres ayant
            des plans de formation en cours.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 my-4">
          {/* Statistiques */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Impact de l&apos;envoi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Plans actifs
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{activePlans.length}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Membres concernés
                    </span>
                  </div>
                  <p className="text-2xl font-bold">
                    {membersWithIncompletePlans}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    sur {totalMembers} membres
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Emails à envoyer
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    ~{membersWithIncompletePlans}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avertissements */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-800">
                Points d&apos;attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-orange-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>
                    Chaque membre recevra un seul email récapitulant tous ses
                    plans en cours
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>
                    Les membres ayant terminé tous leurs plans ne seront pas
                    notifiés
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>
                    Un délai de 48 heures sera appliqué avant le prochain rappel
                    global
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>
                    L&apos;envoi peut prendre quelques minutes selon le nombre
                    de destinataires
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

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

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSendingBulk}>
            Annuler
          </AlertDialogCancel>
          <Button
            onClick={handleSendReminders}
            disabled={!isConfirmed || isSendingBulk}
            variant={isConfirmed ? "default" : "secondary"}
          >
            {isSendingBulk ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <BellRing className="w-4 h-4 mr-2" />
                Envoyer les rappels
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
