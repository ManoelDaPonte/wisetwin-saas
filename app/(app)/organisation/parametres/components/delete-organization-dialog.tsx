"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface DeleteOrganizationDialogProps {
  organizationName: string
  onDelete: () => void
  isDeleting: boolean
}

export function DeleteOrganizationDialog({
  organizationName,
  onDelete,
  isDeleting,
}: DeleteOrganizationDialogProps) {
  const [confirmationText, setConfirmationText] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = async () => {
    if (confirmationText !== organizationName) {
      toast.error("Le nom de l'organisation ne correspond pas")
      return
    }

    onDelete()
    // Le dialog sera fermé automatiquement après la suppression réussie
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer l&apos;organisation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Êtes-vous absolument sûr ?</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Cela supprimera définitivement votre organisation
            &quot;{organizationName}&quot; et supprimera toutes les données associées.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Tapez <span className="font-mono font-bold">{organizationName}</span> pour confirmer :
          </p>
          <Input 
            placeholder="Nom de l'organisation"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || confirmationText !== organizationName}
          >
            {isDeleting ? "Suppression..." : "Je comprends, supprimer l'organisation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}