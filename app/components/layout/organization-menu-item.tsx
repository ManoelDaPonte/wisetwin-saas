"use client"

import React from "react"
import { Building2, User, Check } from "lucide-react"
import { type Organization } from "@/app/stores/organization-store"
import { DropdownMenuItem } from "@/app/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface OrganizationMenuItemProps {
  organization?: Organization
  isPersonal?: boolean
  isActive: boolean
  onSelect: () => void
}

export const OrganizationMenuItem = React.memo(function OrganizationMenuItem({
  organization,
  isPersonal = false,
  isActive,
  onSelect,
}: OrganizationMenuItemProps) {
  const Icon = isPersonal ? User : Building2
  const name = isPersonal ? "Espace personnel" : organization?.name || ""
  const role = organization?.role?.toLowerCase()
  
  return (
    <DropdownMenuItem 
      className="gap-2 p-2" 
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 flex-1">
        <Icon className="h-4 w-4" />
        <div className="flex flex-col flex-1">
          <span className={cn("text-sm", isActive && "font-semibold")}>
            {name}
          </span>
          {role && (
            <span className="text-xs text-muted-foreground capitalize">
              {role}
            </span>
          )}
        </div>
        {isActive && <Check className="h-4 w-4 ml-auto" />}
      </div>
    </DropdownMenuItem>
  )
})