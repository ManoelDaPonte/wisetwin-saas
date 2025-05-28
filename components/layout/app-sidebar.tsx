"use client"

import * as React from "react"
import {
  Home,
  LayoutDashboard,
  Boxes,
  Building2,
} from "lucide-react"
import { useIsPersonalSpace } from "@/stores/organization-store"

import { NavMain } from "@/components/navigation/nav-main"
import { NavUser } from "@/components/navigation/nav-user"
import { OrganizationSwitcher } from "@/components/layout/organization-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isPersonalSpace = useIsPersonalSpace()
  
  const navigationItems = React.useMemo(() => {
    const items = [
      {
        title: "Home",
        url: "/home",
        icon: Home,
        isActive: true,
      },
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Wisetwin",
        url: "/wisetwin",
        icon: Boxes,
      },
      {
        title: "Wisetrainer",
        url: "/wisetrainer",
        icon: Boxes,
      },
    ]
    
    // Ajouter Organization seulement si on est dans une organisation
    if (!isPersonalSpace) {
      items.push({
        title: "Organization",
        url: "/organization",
        icon: Building2,
      })
    }
    
    return items
  }, [isPersonalSpace])
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
