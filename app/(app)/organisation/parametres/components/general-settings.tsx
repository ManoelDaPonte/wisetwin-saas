"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Save } from "lucide-react"

interface GeneralSettingsProps {
  organizationName: string
  organizationDescription: string | null
  canEdit: boolean
  isUpdating: boolean
  onUpdate: (data: { name: string; description?: string }) => void
}

export function GeneralSettings({
  organizationName: initialName,
  organizationDescription: initialDescription,
  canEdit,
  isUpdating,
  onUpdate,
}: GeneralSettingsProps) {
  const [organizationName, setOrganizationName] = useState(initialName)
  const [organizationDescription, setOrganizationDescription] = useState(initialDescription || "")
  
  useEffect(() => {
    setOrganizationName(initialName)
    setOrganizationDescription(initialDescription || "")
  }, [initialName, initialDescription])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    onUpdate({
      name: organizationName,
      description: organizationDescription || undefined,
    })
  }

  // Ne pas afficher pour les membres
  if (!canEdit) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
        <CardDescription>
          Mettez à jour les informations de base de votre organisation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="org-name">Nom de l'organisation</Label>
            <Input 
              id="org-name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Nom de votre organisation"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="org-description">Description</Label>
            <Textarea 
              id="org-description"
              value={organizationDescription}
              onChange={(e) => setOrganizationDescription(e.target.value)}
              placeholder="Décrivez votre organisation..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Cette description apparaîtra sur votre profil public
            </p>
          </div>
          
          <Button type="submit" disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}