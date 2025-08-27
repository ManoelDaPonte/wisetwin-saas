"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminOrganization } from "@/lib/admin/organizations"
import { toast } from "sonner"

interface EditOrganizationDialogProps {
  organization: AdminOrganization | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function EditOrganizationDialog({
  organization,
  open,
  onOpenChange,
  onUpdate,
}: EditOrganizationDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [maxUsers, setMaxUsers] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (organization) {
      setName(organization.name)
      setDescription(organization.description || "")
      setMaxUsers(organization.maxUsers)
    }
  }, [organization])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return

    setIsLoading(true)
    try {
      // Mise à jour des données générales
      const updateResponse = await fetch(`/api/admin/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      })

      if (!updateResponse.ok) {
        const error = await updateResponse.json()
        throw new Error(error.error || "Erreur lors de la mise à jour")
      }

      // Mise à jour de maxUsers si changé
      if (maxUsers !== organization.maxUsers) {
        const maxUsersResponse = await fetch(
          `/api/admin/organizations/${organization.id}/max-users`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ maxUsers }),
          }
        )

        if (!maxUsersResponse.ok) {
          const error = await maxUsersResponse.json()
          throw new Error(error.error || "Erreur lors de la mise à jour de la limite")
        }
      }

      toast.success("Organisation mise à jour avec succès")
      onUpdate()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen)
    }
  }

  if (!organization) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier l&apos;organisation</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l&apos;organisation &quot;{organization.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l&apos;organisation *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom de l&apos;organisation"
                maxLength={100}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description optionnelle"
                maxLength={500}
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsers">Limite d&apos;utilisateurs *</Label>
              <Input
                id="maxUsers"
                type="number"
                value={maxUsers}
                onChange={(e) => setMaxUsers(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="1000"
                required
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Nombre maximum d&apos;utilisateurs autorisés (entre 1 et 1000)
              </p>
            </div>

            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <strong>Membres actuels :</strong> {organization.membersCount} / {organization.maxUsers}
              <br />
              <strong>Container ID :</strong> {organization.azureContainerId}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}