"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LogOut } from "lucide-react"
import { useState } from "react"

interface LeaveOrganizationProps {
  canLeave: boolean
  organizationName: string
  onLeave: () => void
  isLeaving: boolean
}

export function LeaveOrganization({
  canLeave,
  organizationName,
  onLeave,
  isLeaving,
}: LeaveOrganizationProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Seuls les non-propriétaires peuvent quitter l'organisation
  if (!canLeave) return null

  const handleLeave = async () => {
    onLeave()
    // Le dialog sera fermé et la redirection sera gérée par le parent
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quitter l'organisation</CardTitle>
        <CardDescription>
          Vous ne pourrez plus accéder aux ressources de cette organisation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Si vous quittez cette organisation, vous perdrez l'accès à tous ses projets et ressources.
          Vous devrez être réinvité pour y accéder à nouveau.
        </p>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Quitter l'organisation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Êtes-vous sûr de vouloir quitter ?</DialogTitle>
              <DialogDescription>
                Vous allez quitter l'organisation "{organizationName}".
                Cette action est irréversible et vous perdrez l'accès à toutes les ressources.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isLeaving}
              >
                Annuler
              </Button>
              <Button 
                variant="destructive"
                onClick={handleLeave}
                disabled={isLeaving}
              >
                {isLeaving ? "Sortie..." : "Quitter l'organisation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}