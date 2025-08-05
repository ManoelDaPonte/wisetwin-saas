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
	Crown,
} from "lucide-react";
import {
	useIsPersonalSpace,
	useOrganizationStore,
} from "@/stores/organization-store";
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
	const { activeOrganization } = useOrganizationStore();
	const { data: session } = useSession();

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

	// Navigation Super-admin (seulement pour @wisetwin.eu)
	const superAdminNavItems = React.useMemo(() => {
		if (!session?.user?.email || !canAccessAdminPanel(session.user.email)) {
			return [];
		}

		const items: NavigationItem[] = [
			{
				title: "Super-admin",
				url: "/admin",
				icon: Crown,
				items: [
					{
						title: "Formations",
						url: "/admin/formations",
					},
					{
						title: "Utilisateurs",
						url: "/admin/utilisateurs",
					},
					{
						title: "Organisations",
						url: "/admin/organisations",
					},
				],
			},
		];

		return items;
	}, [session?.user?.email]);

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<OrganizationSwitcher />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={mainNavItems} label="Navigation" />
				<NavMain items={platformNavItems} label="Plateformes" />
				{organizationNavItems.length > 0 && (
					<NavMain
						items={organizationNavItems}
						label="Administration"
					/>
				)}
				{superAdminNavItems.length > 0 && (
					<NavMain items={superAdminNavItems} label="Super-admin" />
				)}
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
