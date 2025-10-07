"use client";

import * as React from "react";
import { Home, BarChart3, Activity, Award, Box, Building2, Users, GraduationCap, Settings, Library, UserCog, Building } from "lucide-react";
import { useIsPersonalSpace } from "@/stores/organization-store";
import { useTranslations } from "@/hooks/use-translations";
import { useSession } from "next-auth/react";
import { canAccessAdminPanel } from "@/lib/admin/permissions";
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
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const isPersonalSpace = useIsPersonalSpace();
	const t = useTranslations();
	// Récupération du contexte de l'organisation
	const { data: session } = useSession();

	// Section Personnel
	const personalNavItems = React.useMemo(() => {
		const items: NavigationItem[] = [
			{
				title: t.navigation.home,
				url: "/accueil",
				icon: Home,
			},
			{
				title: t.navigation.myDashboard,
				url: "/tableau-de-bord",
				icon: BarChart3,
			},
			{
				title: t.navigation.myActivity,
				url: "/tableau-de-bord/activite-recente",
				icon: Activity,
			},
			{
				title: t.navigation.myCertifications,
				url: "/tableau-de-bord/certifications",
				icon: Award,
			},
		];

		return items;
	}, [t]);

	// Section Application
	const applicationNavItems = React.useMemo(() => {
		const items: NavigationItem[] = [
			{
				title: t.navigation.wisetrainer,
				url: "/wisetrainer",
				icon: Box,
			},
		];

		return items;
	}, [t]);

	// Section Organisation
	const organizationNavItems = React.useMemo(() => {
		if (isPersonalSpace) return [];

		const items: NavigationItem[] = [
			{
				title: t.navigation.organizationOverview,
				url: "/organisation",
				icon: Building2,
			},
			{
				title: t.navigation.members,
				url: "/organisation/membres",
				icon: Users,
			},
			{
				title: t.navigation.trainingPlans,
				url: "/organisation/plan-de-formation",
				icon: GraduationCap,
			},
			{
				title: t.navigation.analytics,
				url: "/statistiques",
				icon: BarChart3,
			},
			{
				title: t.navigation.settings,
				url: "/organisation/parametres",
				icon: Settings,
			},
		];

		return items;
	}, [isPersonalSpace, t]);

	// Section Super Admin
	const superAdminNavItems = React.useMemo(() => {
		if (!session?.user?.email || !canAccessAdminPanel(session.user.email)) {
			return [];
		}

		const items: NavigationItem[] = [
			{
				title: t.navigation.trainingCatalog,
				url: "/admin/formations",
				icon: Library,
			},
			{
				title: t.navigation.allUsers,
				url: "/admin/utilisateurs",
				icon: UserCog,
			},
			{
				title: t.navigation.allOrganizations,
				url: "/admin/organisations",
				icon: Building,
			},
		];

		return items;
	}, [session?.user?.email, t]);

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<OrganizationSwitcher />
			</SidebarHeader>
			<SidebarContent>
				<NavMain
					items={personalNavItems}
					label={t.navigation.personal}
				/>
				<NavMain
					items={applicationNavItems}
					label={t.navigation.application}
				/>
				{organizationNavItems.length > 0 && (
					<NavMain
						items={organizationNavItems}
						label={t.navigation.organization}
					/>
				)}
				{superAdminNavItems.length > 0 && (
					<NavMain
						items={superAdminNavItems}
						label={t.navigation.superAdmin}
					/>
				)}
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
