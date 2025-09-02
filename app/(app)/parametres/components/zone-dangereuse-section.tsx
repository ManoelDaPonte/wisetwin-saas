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
import { useTranslations } from "@/hooks/use-translations"

export function ZoneDangereuseSection() {
  const t = useTranslations()
  const { deleteAccount, isLoading } = useUserActions()
  const [deletePassword, setDeletePassword] = useState("")

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">{t.settings.dangerZone.title}</CardTitle>
        <CardDescription>{t.settings.dangerZone.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">{t.settings.dangerZone.deleteAccount.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t.settings.dangerZone.deleteAccount.description}
            </p>
            <div className="space-y-2">
              <Label htmlFor="delete-password">{t.settings.dangerZone.deleteAccount.passwordLabel}</Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder={t.settings.dangerZone.deleteAccount.passwordPlaceholder}
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
                    {t.settings.dangerZone.deleteAccount.button}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.settings.dangerZone.deleteAccount.confirmTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t.settings.dangerZone.deleteAccount.confirmDescription}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.settings.dangerZone.deleteAccount.cancel}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        if (!deletePassword) {
                          toast.error(t.settings.dangerZone.deleteAccount.passwordRequired)
                          return
                        }
                        try {
                          await deleteAccount({ password: deletePassword })
                          toast.success(t.settings.dangerZone.deleteAccount.success)
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : t.settings.dangerZone.deleteAccount.error)
                        }
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t.settings.dangerZone.deleteAccount.confirmButton}
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