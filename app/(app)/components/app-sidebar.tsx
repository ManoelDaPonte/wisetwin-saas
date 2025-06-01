"use client"

import * as React from "react"
import {
  Home,
  LayoutDashboard,
  Boxes,
  Building2,
  Users,
  Settings,
  Shield,
  Award,
  BarChart3,
  Box,
  Book,
} from "lucide-react"
import { useIsPersonalSpace } from "@/app/stores/organization-store"
import { LucideIcon } from "lucide-react"

import { NavMain } from "@/app/(app)/components/nav-main"
import { NavUser } from "@/app/(app)/components/nav-user"
import { OrganizationSwitcher } from "@/app/(app)/components/organization-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

type NavigationItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isPersonalSpace = useIsPersonalSpace()
  
  // Groupes de navigation
  const mainNavItems = React.useMemo(() => {
    const items: NavigationItem[] = [
      {
        title: "Accueil",
        url: "/accueil",
        icon: Home,
        isActive: true,
      },
      {
        title: "Tableau de bord",
        url: "/tableau-de-bord",
        icon: LayoutDashboard,
        items: [
          {
            title: "Vue d'ensemble",
            url: "/tableau-de-bord",
          },
          {
            title: "Certifications",
            url: "/tableau-de-bord/certifications",
          },
        ],
      },
    ]
    
    return items
  }, [])

  const platformNavItems = React.useMemo(() => {
    const items: NavigationItem[] = [
      {
        title: "Wisetour",
        url: "/wisetour",
        icon: Box,
      },
      {
        title: "Wisetrainer",
        url: "/wisetrainer",
        icon: Book,
      },
    ]
    
    return items
  }, [])

  const organizationNavItems = React.useMemo(() => {
    if (isPersonalSpace) return []
    
    const items: NavigationItem[] = [
      {
        title: "Organisation",
        url: "/organisation",
        icon: Building2,
        items: [
          {
            title: "Vue d'ensemble",
            url: "/organisation",
          },
          {
            title: "Membres",
            url: "/organisation/membres",
          },
          {
            title: "Paramètres",
            url: "/organisation/parametres",
          },
          {
            title: "Tableau de bord",
            url: "/organisation/tableau-de-bord",
          },
        ],
      },
    ]
    
    return items
  }, [isPersonalSpace])
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainNavItems} label="Navigation" />
        <NavMain items={platformNavItems} label="Plateformes" />
        {organizationNavItems.length > 0 && (
          <NavMain items={organizationNavItems} label="Administration" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
