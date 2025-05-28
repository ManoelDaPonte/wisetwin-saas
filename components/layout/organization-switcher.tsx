"use client"

import * as React from "react"
import { Building2, ChevronsUpDown, Plus, User } from "lucide-react"
import { useSession } from "next-auth/react"
import { useOrganizationStore, useIsPersonalSpace } from "@/stores/organization-store"

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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"


export function OrganizationSwitcher() {
  const { data: session } = useSession()
  const { isMobile } = useSidebar()
  const {
    activeOrganization,
    organizations,
    setOrganizations,
    switchToOrganization,
    switchToPersonal,
    addOrganization
  } = useOrganizationStore()
  const isPersonalSpace = useIsPersonalSpace()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [newOrgName, setNewOrgName] = React.useState("")
  const [newOrgDescription, setNewOrgDescription] = React.useState("")

  React.useEffect(() => {
    if (session?.user) {
      fetchOrganizations()
    }
  }, [session])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations")
      if (!response.ok) throw new Error("Failed to fetch organizations")
      const data = await response.json()
      setOrganizations(data)
    } catch (error) {
      console.error("Error fetching organizations:", error)
    }
  }

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newOrgName,
          description: newOrgDescription,
        }),
      })

      if (!response.ok) throw new Error("Failed to create organization")

      const newOrg = await response.json()
      addOrganization(newOrg)
      setIsDialogOpen(false)
      setNewOrgName("")
      setNewOrgDescription("")
      // L'organisation sera automatiquement sélectionnée grâce à addOrganization
    } catch (error) {
      console.error("Error creating organization:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {isPersonalSpace ? (
                  <User className="h-4 w-4" />
                ) : (
                  activeOrganization?.name.charAt(0).toUpperCase() || <Building2 className="h-4 w-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {isPersonalSpace ? "Espace personnel" : activeOrganization?.name || "Sélectionner"}
                </span>
                <span className="truncate text-xs">
                  {isPersonalSpace ? session?.user?.email : activeOrganization?.role || ""}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel>Espaces de travail</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Espace personnel */}
            <DropdownMenuItem
              onClick={() => {
                switchToPersonal()
              }}
              className={isPersonalSpace ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center rounded">
                  <User className="h-3 w-3" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Espace personnel</span>
                  <span className="truncate text-xs">{session?.user?.email}</span>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => {
                  switchToOrganization(org)
                }}
                className={activeOrganization?.id === org.id ? "bg-accent" : ""}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center rounded">
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{org.name}</span>
                    <span className="truncate text-xs">{org.role}</span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Organization
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Organization</DialogTitle>
                  <DialogDescription>
                    Create a new organization to collaborate with others.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateOrganization}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        placeholder="Enter organization name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newOrgDescription}
                        onChange={(e) => setNewOrgDescription(e.target.value)}
                        placeholder="Enter organization description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Organization"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
} 