"use client";

import * as React from "react";
import { Building2, ChevronsUpDown, Plus, User, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  useOrganizationStore,
  useIsPersonalSpace,
} from "@/stores/organization-store";
import { useOrganizations } from "@/app/hooks/use-organizations";
import { CreateOrganizationDialog } from "@/app/components/create-organization-dialog";
import { JoinOrganizationDialog } from "@/app/components/join-organization-dialog";
import { useTranslations } from "@/hooks/use-translations";
import { OrganizationMenuItem } from "@/app/components/organization-menu-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function OrganizationSwitcher() {
  const { data: session } = useSession();
  const { isMobile } = useSidebar();
  const router = useRouter();
  const t = useTranslations();
  const {
    activeOrganization,
    organizations,
    switchToOrganization,
    switchToPersonal,
  } = useOrganizationStore();
  const isPersonalSpace = useIsPersonalSpace();
  const { fetchOrganizations } = useOrganizations();

  const handleSwitchToPersonal = React.useCallback(() => {
    switchToPersonal();
    // Toujours rediriger vers accueil lors du changement de contexte
    router.push("/accueil");
  }, [switchToPersonal, router]);

  const handleSwitchToOrganization = React.useCallback(
    (org: (typeof organizations)[number]) => {
      switchToOrganization(org);
      // Toujours rediriger vers accueil lors du changement d'organisation
      router.push("/accueil");
    },
    [switchToOrganization, router]
  );

  React.useEffect(() => {
    if (session?.user) {
      fetchOrganizations();
    }
  }, [session, fetchOrganizations]);

  const CurrentIcon = isPersonalSpace ? User : Building2;
  const currentName = isPersonalSpace
    ? t.organizationSwitcher.personalSpace
    : activeOrganization?.name || t.organizationSwitcher.select;

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
                  {isPersonalSpace
                    ? t.organizationSwitcher.labels.personal
                    : activeOrganization?.role ||
                      t.organizationSwitcher.labels.organization}
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
              {t.organizationSwitcher.labels.spaces}
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
                  {t.organizationSwitcher.labels.organizations}
                </DropdownMenuLabel>
                {organizations.map((org) => (
                  <OrganizationMenuItem
                    key={org.id}
                    organization={org}
                    isActive={activeOrganization?.id === org.id}
                    onSelect={() => handleSwitchToOrganization(org)}
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
                  {t.organizationSwitcher.actions.createOrganization}
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
                  {t.organizationSwitcher.actions.joinOrganization}
                </div>
              </DropdownMenuItem>
            </JoinOrganizationDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
