"use client"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useMembers } from "@/app/(app)/organisation/hooks/use-members"

interface TransferOwnershipDialogProps {
  organizationName: string
  onTransfer: (newOwnerId: string) => void
  isTransferring: boolean
}

export function TransferOwnershipDialog({
  onTransfer,
  isTransferring,
}: TransferOwnershipDialogProps) {
  const { members } = useMembers()
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)

  const eligibleMembers = members?.filter(
    member => member.role === 'ADMIN' && !member.isOwner
  ) || []

  const handleTransfer = async () => {
    if (!selectedMemberId) {
      toast.error("Veuillez sélectionner un membre")
      return
    }

    onTransfer(selectedMemberId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Transférer la propriété
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transférer la propriété</DialogTitle>
          <DialogDescription>
            Transférez la propriété de cette organisation à un autre administrateur.
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-owner">Nouveau propriétaire</Label>
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger id="new-owner">
                <SelectValue placeholder="Sélectionner un administrateur" />
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Aucun administrateur éligible
                  </SelectItem>
                ) : (
                  eligibleMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name || member.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Seuls les administrateurs peuvent devenir propriétaires
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isTransferring}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleTransfer}
            disabled={isTransferring || !selectedMemberId || eligibleMembers.length === 0}
          >
            {isTransferring ? "Transfert..." : "Transférer la propriété"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}