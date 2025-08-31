"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle } from "lucide-react"
import { DeleteOrganizationDialog } from "./delete-organization-dialog"
import { TransferOwnershipDialog } from "./transfer-ownership-dialog"

interface DangerZoneProps {
  isOwner: boolean
  organizationName: string
  onDelete: () => void
  onTransfer: (newOwnerId: string) => void
  isDeleting: boolean
  isTransferring: boolean
}

export function DangerZone({
  isOwner,
  organizationName,
  onDelete,
  onTransfer,
  isDeleting,
  isTransferring,
}: DangerZoneProps) {
  // Seul le propriétaire peut voir la zone dangereuse
  if (!isOwner) return null

  return (
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
            <TransferOwnershipDialog 
              organizationName={organizationName}
              onTransfer={onTransfer}
              isTransferring={isTransferring}
            />
          </div>
          
          <Separator />
          
          <div>
            <h4 className="text-sm font-medium mb-2">Supprimer l&apos;organisation</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Une fois supprimée, l&apos;organisation et toutes ses données seront définitivement perdues
            </p>
            <DeleteOrganizationDialog 
              organizationName={organizationName}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}