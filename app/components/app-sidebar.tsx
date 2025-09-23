"use client";

import * as React from "react";
import { Home, LayoutDashboard, Building2, Users, BookOpen, Settings, List, Award, Box } from "lucide-react";
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
	items?: {
		title: string;
		url: string;
	}[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const isPersonalSpace = useIsPersonalSpace();
	const t = useTranslations();
	// Récupération du contexte de l'organisation
	const { data: session } = useSession();

	// Groupes de navigation
	const mainNavItems = React.useMemo(() => {
		const items: NavigationItem[] = [
			{
				title: t.navigation.home,
				url: "/accueil",
				icon: Home,
				isActive: true,
			},
			{
				title: t.navigation.dashboard,
				url: "/tableau-de-bord",
				icon: LayoutDashboard,
			},
			{
				title: t.navigation.certifications,
				url: "/tableau-de-bord/certifications",
				icon: Award,
			},
		];

		return items;
	}, [t]);

	const platformNavItems = React.useMemo(() => {
		const items: NavigationItem[] = [
			{
				title: t.navigation.wisetrainer,
				url: "/wisetrainer",
				icon: Box,
				items: [
					{
						title: t.navigation.allTrainings,
						url: "/wisetrainer",
					},
					{
						title: t.navigation.completedTrainings,
						url: "/wisetrainer/formations-terminees",
					},
				],
			},
		];

		return items;
	}, [t]);

	const organizationNavItems = React.useMemo(() => {
		if (isPersonalSpace) return [];

		const items: NavigationItem[] = [
			{
				title: t.navigation.overview,
				url: "/organisation",
				icon: Building2,
			},
			{
				title: t.navigation.members,
				url: "/organisation/membres",
				icon: Users,
			},
			{
				title: t.navigation.trainingPlan,
				url: "/organisation/plan-de-formation",
				icon: BookOpen,
			},
			{
				title: t.navigation.settings,
				url: "/organisation/parametres",
				icon: Settings,
			},
		];

		return items;
	}, [isPersonalSpace, t]);

	// Navigation Super-admin (seulement pour @wisetwin.eu)
	const superAdminNavItems = React.useMemo(() => {
		if (!session?.user?.email || !canAccessAdminPanel(session.user.email)) {
			return [];
		}

		const items: NavigationItem[] = [
			{
				title: t.navigation.formations,
				url: "/admin/formations",
				icon: List,
			},
			{
				title: t.navigation.users,
				url: "/admin/utilisateurs",
				icon: Users,
			},
			{
				title: t.navigation.organizations,
				url: "/admin/organisations",
				icon: Building2,
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
				<NavMain items={mainNavItems} label={t.navigation.mainNavigation} />
				<NavMain items={platformNavItems} label={t.navigation.application} />
				{organizationNavItems.length > 0 && (
					<NavMain
						items={organizationNavItems}
						label={t.navigation.administration}
					/>
				)}
				{superAdminNavItems.length > 0 && (
					<NavMain items={superAdminNavItems} label={t.navigation.superAdmin} />
				)}
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
