"use client"

import * as React from "react"
import { Building2, ChevronsUpDown, Plus, User, UserPlus } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useOrganizationStore, useIsPersonalSpace } from "@/app/stores/organization-store"
import { useOrganizations } from "@/app/hooks/use-organizations"
import { CreateOrganizationDialog } from "@/app/components/create-organization-dialog"
import { JoinOrganizationDialog } from "@/app/components/join-organization-dialog"
import { OrganizationMenuItem } from "@/app/components/organization-menu-item"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function OrganizationSwitcher() {
  const { data: session } = useSession()
  const { isMobile } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()
  const {
    activeOrganization,
    organizations,
    switchToOrganization,
    switchToPersonal,
  } = useOrganizationStore()
  const isPersonalSpace = useIsPersonalSpace()
  const { fetchOrganizations } = useOrganizations()
  
  const handleSwitchToPersonal = React.useCallback(() => {
    switchToPersonal()
    // Si on est sur une page organisation, rediriger vers accueil
    if (pathname.startsWith('/organisation')) {
      router.push('/accueil')
    }
  }, [switchToPersonal, pathname, router])

  React.useEffect(() => {
    if (session?.user) {
      fetchOrganizations()
    }
  }, [session, fetchOrganizations])

  const CurrentIcon = isPersonalSpace ? User : Building2
  const currentName = isPersonalSpace ? "Espace personnel" : activeOrganization?.name || "Sélectionner"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <CurrentIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{currentName}</span>
                <span className="truncate text-xs">
                  {isPersonalSpace ? "Personnel" : activeOrganization?.role || "Organisation"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-[220px] rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Espaces
            </DropdownMenuLabel>
            
            <OrganizationMenuItem
              isPersonal
              isActive={isPersonalSpace}
              onSelect={handleSwitchToPersonal}
            />
            
            {organizations.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Organisations
                </DropdownMenuLabel>
                {organizations.map((org) => (
                  <OrganizationMenuItem
                    key={org.id}
                    organization={org}
                    isActive={activeOrganization?.id === org.id}
                    onSelect={() => switchToOrganization(org)}
                  />
                ))}
              </>
            )}
            
            <DropdownMenuSeparator />
            
            <CreateOrganizationDialog>
              <DropdownMenuItem 
                className="gap-2 p-2" 
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Créer une organisation
                </div>
              </DropdownMenuItem>
            </CreateOrganizationDialog>
            
            <JoinOrganizationDialog>
              <DropdownMenuItem 
                className="gap-2 p-2"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <UserPlus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Rejoindre une organisation
                </div>
              </DropdownMenuItem>
            </JoinOrganizationDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}