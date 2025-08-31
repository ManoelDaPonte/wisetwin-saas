"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { useUserActions } from "../hooks/use-user-actions"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ZoneDangereuseSection() {
  const { deleteAccount, isLoading } = useUserActions()
  const [deletePassword, setDeletePassword] = useState("")

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
        <CardDescription>Actions irréversibles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Supprimer le compte</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cette action supprimera définitivement votre compte et toutes vos données. Cette action est irréversible.
            </p>
            <div className="space-y-2">
              <Label htmlFor="delete-password">Mot de passe pour confirmer</Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Entrez votre mot de passe pour confirmer"
              />
            </div>
            <div className="pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    disabled={isLoading || !deletePassword}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer mon compte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Cela supprimera définitivement votre compte,
                      toutes vos données et tous les conteneurs Azure associés.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        if (!deletePassword) {
                          toast.error("Veuillez entrer votre mot de passe pour confirmer")
                          return
                        }
                        try {
                          await deleteAccount({ password: deletePassword })
                          toast.success("Compte supprimé avec succès")
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression du compte")
                        }
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Supprimer définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}