"use client";

import * as React from "react";
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
} from "lucide-react";
import {
  useIsPersonalSpace,
  useOrganizationStore,
} from "@/app/stores/organization-store";
import { LucideIcon } from "lucide-react";

import { NavMain } from "@/app/components/nav-main";
import { NavUser } from "@/app/components/nav-user";
import { OrganizationSwitcher } from "@/app/components/organization-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

type NavigationItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isPersonalSpace = useIsPersonalSpace();
  const { activeOrganization } = useOrganizationStore();

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
    ];

    return items;
  }, []);

  const platformNavItems = React.useMemo(() => {
    const items: NavigationItem[] = [
      {
        title: "Wisetour",
        url: "/wisetour",
        icon: Box,
        items: [
          {
            title: "Catalogue",
            url: "/wisetour",
          },
          {
            title: "Mes visites",
            url: "/wisetour/mes-visites",
          },
        ],
      },
      {
        title: "Wisetrainer",
        url: "/wisetrainer",
        icon: Book,
        items: [
          {
            title: "Catalogue",
            url: "/wisetrainer",
          },
          {
            title: "Mes formations",
            url: "/wisetrainer/mes-formations",
          },
        ],
      },
    ];

    return items;
  }, []);

  const organizationNavItems = React.useMemo(() => {
    if (isPersonalSpace) return [];

    const isMember = activeOrganization?.role === "MEMBER";

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
          // Tableau de bord seulement pour OWNER et ADMIN
          ...(isMember
            ? []
            : [
                {
                  title: "Tableau de bord",
                  url: "/organisation/tableau-de-bord",
                },
              ]),
        ],
      },
    ];

    return items;
  }, [isPersonalSpace, activeOrganization?.role]);
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
  );
}
