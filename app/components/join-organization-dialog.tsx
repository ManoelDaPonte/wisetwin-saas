"use client"

import { useState } from "react"
import { useOrganizations } from "@/app/hooks/use-organizations"
import { useTranslations } from "@/hooks/use-translations"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus } from "lucide-react"

interface JoinOrganizationDialogProps {
  children?: React.ReactNode
}

export function JoinOrganizationDialog({ children }: JoinOrganizationDialogProps) {
  const t = useTranslations()
  const { fetchOrganizations } = useOrganizations()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Accepter l'invitation directement avec le code
      const response = await fetch(`/api/invitations/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase() })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t.joinOrganizationDialog.errors.invalidCode)
      }

      // Rafraîchir la liste des organisations
      await fetchOrganizations()
      setOpen(false)
      setCode("")
    } catch (err) {
      setError(err instanceof Error ? err.message : t.joinOrganizationDialog.errors.generalError)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setCode("")
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full justify-start">
            <UserPlus className="mr-2 h-4 w-4" />
            {t.joinOrganizationDialog.title}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t.joinOrganizationDialog.title}</DialogTitle>
            <DialogDescription>
              {t.joinOrganizationDialog.description}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">{t.joinOrganizationDialog.fields.code}</Label>
              <Input
                id="code"
                type="text"
                placeholder={t.joinOrganizationDialog.fields.codePlaceholder}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="text-center text-xl font-mono tracking-widest"
                required
                disabled={loading}
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                {t.joinOrganizationDialog.fields.codeDescription}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              {t.joinOrganizationDialog.buttons.cancel}
            </Button>
            <Button
              type="submit"
              disabled={loading || code.length !== 8}
            >
              {loading ? t.joinOrganizationDialog.buttons.processing : t.joinOrganizationDialog.buttons.join}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}