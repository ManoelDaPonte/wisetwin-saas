"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useOrganizationStore } from "@/app/stores/organization-store"
import { useEffect, useState } from "react"
import { 
  Save,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const { activeOrganization } = useOrganizationStore()
  
  const [organizationName, setOrganizationName] = useState("")
  const [organizationDescription, setOrganizationDescription] = useState("")
  const [organizationUrl, setOrganizationUrl] = useState("")
  
  useEffect(() => {
    if (activeOrganization) {
      setOrganizationName(activeOrganization.name)
      setOrganizationDescription(activeOrganization.description || "")
      setOrganizationUrl(`wisetwin.app/${activeOrganization.name.toLowerCase().replace(/\s+/g, '-')}`)
    }
  }, [activeOrganization])
  
  if (!activeOrganization) {
    return null
  }

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Paramètres de l'organisation</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres et la configuration de {activeOrganization.name}
        </p>
      </div>

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>
            Mettez à jour les informations de base de votre organisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="org-name">Nom de l'organisation</Label>
            <Input 
              id="org-name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Nom de votre organisation"
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
          
          <div className="space-y-2">
            <Label htmlFor="org-url">URL de l'organisation</Label>
            <Input 
              id="org-url"
              value={organizationUrl}
              onChange={(e) => setOrganizationUrl(e.target.value)}
              placeholder="wisetwin.app/votre-organisation"
            />
            <p className="text-xs text-muted-foreground">
              Cette URL sera utilisée pour accéder à votre espace public
            </p>
          </div>
          
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les modifications
          </Button>
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card>
        <CardHeader>
          <CardTitle>Préférences</CardTitle>
          <CardDescription>
            Configurez les préférences de votre organisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="default-role">Rôle par défaut pour les nouveaux membres</Label>
            <select 
              id="default-role"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="member">Membre</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invite-permissions">Qui peut inviter de nouveaux membres</Label>
            <select 
              id="invite-permissions"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="all">Tous les membres</option>
              <option value="admin">Administrateurs uniquement</option>
              <option value="owner">Propriétaire uniquement</option>
            </select>
          </div>
          
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les préférences
          </Button>
        </CardContent>
      </Card>

      {/* Zone dangereuse */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
          <CardDescription>
            Actions irréversibles concernant votre organisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
              Ces actions sont définitives et ne peuvent pas être annulées. Procédez avec prudence.
            </AlertDescription>
          </Alert>
          
          <Separator />
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Transférer la propriété</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Transférez la propriété de cette organisation à un autre membre
              </p>
              <Button variant="outline" size="sm">
                Transférer la propriété
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Supprimer l'organisation</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Une fois supprimée, l'organisation et toutes ses données seront définitivement perdues
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer l'organisation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Êtes-vous absolument sûr ?</DialogTitle>
                    <DialogDescription>
                      Cette action est irréversible. Cela supprimera définitivement votre organisation
                      "{activeOrganization.name}" et supprimera toutes les données associées.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Tapez <span className="font-mono font-bold">{activeOrganization.name}</span> pour confirmer :
                    </p>
                    <Input placeholder="Nom de l'organisation" />
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Annuler</Button>
                    <Button variant="destructive">
                      Je comprends, supprimer l'organisation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}