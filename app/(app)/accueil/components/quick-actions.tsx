"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrganizationStore, useIsPersonalSpace } from "@/stores/organization-store";
import { useTranslations } from "@/hooks/use-translations";
import { useRouter } from "next/navigation";
import {
	Building2,
	Users,
	BookOpen,
	Award,
	BarChart3,
	ArrowRight,
	Plus,
	LogIn,
	Box,
	Settings,
	GraduationCap,
} from "lucide-react";

export function QuickActions() {
	const router = useRouter();
	const t = useTranslations();
	const { activeOrganization, organizations } = useOrganizationStore();
	const isPersonalSpace = useIsPersonalSpace();

	// Déterminer le contexte et les permissions
	const hasOrganizations = organizations.length > 0;
	const isAdmin = activeOrganization?.role === "ADMIN" || activeOrganization?.role === "OWNER";
	const isOwner = activeOrganization?.role === "OWNER";

	// Actions pour l'espace personnel
	const personalActions = [
		{
			id: "join-org",
			title: t.organization.title,
			description: hasOrganizations
				? t.home.quickActions.manageOrganizations
				: t.organization.joinOrCreate,
			icon: Building2,
			actions: hasOrganizations ? [
				{
					label: t.home.quickActions.viewOrganizations,
					icon: Building2,
					onClick: () => router.push("/organisation"),
				}
			] : [
				{
					label: t.organization.joinWithCode,
					icon: LogIn,
					onClick: () => router.push("/organisation"),
				},
				{
					label: t.organization.createOrganization,
					icon: Plus,
					onClick: () => router.push("/organisation"),
				}
			]
		},
		{
			id: "trainings",
			title: t.training.title,
			description: t.training.subtitle,
			icon: BookOpen,
			actions: [
				{
					label: t.training.wisetrainer,
					icon: Box,
					onClick: () => router.push("/wisetrainer"),
				}
			]
		},
		{
			id: "progress",
			title: t.progress.title,
			description: t.progress.subtitle,
			icon: Award,
			actions: [
				{
					label: t.progress.myDashboard,
					icon: BarChart3,
					onClick: () => router.push("/tableau-de-bord"),
				},
				{
					label: t.progress.myCertifications,
					icon: Award,
					onClick: () => router.push("/tableau-de-bord/certifications"),
				}
			]
		}
	];

	// Actions pour l'espace organisation
	const organizationActions = [
		{
			id: "org-management",
			title: t.home.quickActions.orgManagement,
			description: `${t.home.quickActions.administerOrg} ${activeOrganization?.name}`,
			icon: Building2,
			visible: isAdmin,
			actions: [
				{
					label: t.organization.manageMembers,
					icon: Users,
					onClick: () => router.push("/organisation/membres"),
					visible: isAdmin,
				},
				{
					label: t.home.quickActions.trainingPlans,
					icon: GraduationCap,
					onClick: () => router.push("/organisation/plan-de-formation"),
					visible: isAdmin,
				},
				{
					label: t.home.quickActions.settings,
					icon: Settings,
					onClick: () => router.push("/organisation/parametres"),
					visible: isOwner,
				}
			].filter(a => a.visible !== false)
		},
		{
			id: "org-trainings",
			title: t.home.quickActions.orgTrainings,
			description: t.home.quickActions.accessResources,
			icon: BookOpen,
			actions: [
				{
					label: t.home.quickActions.availableTrainings,
					icon: Box,
					onClick: () => router.push("/wisetrainer"),
				},
				{
					label: t.organization.dashboard,
					icon: BarChart3,
					onClick: () => router.push("/organisation"),
				}
			]
		},
		{
			id: "personal-progress",
			title: t.home.quickActions.myProgress,
			description: t.home.quickActions.trackProgress,
			icon: Award,
			actions: [
				{
					label: t.progress.myDashboard,
					icon: BarChart3,
					onClick: () => router.push("/tableau-de-bord"),
				},
				{
					label: t.progress.myCertifications,
					icon: Award,
					onClick: () => router.push("/tableau-de-bord/certifications"),
				}
			]
		}
	];

	// Sélectionner les actions selon le contexte
	const actions = isPersonalSpace ? personalActions : organizationActions.filter(a => a.visible !== false);

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold tracking-tight mb-2">
					{t.home.quickActions.title}
				</h2>
				<p className="text-muted-foreground">
					{isPersonalSpace
						? t.home.quickActions.personalDescription
						: `${t.home.quickActions.orgDescription} ${activeOrganization?.name}`}
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{actions.map((section) => {
					const Icon = section.icon;

					return (
						<Card key={section.id} className="hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 bg-primary/10 rounded-lg">
										<Icon className="h-8 w-8 text-primary" />
									</div>
								</div>
								<CardTitle>{section.title}</CardTitle>
								<CardDescription>
									{section.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{section.actions.map((action, index) => {
									const ActionIcon = action.icon;

									return (
										<Button
											key={index}
											className="w-full justify-between"
											variant="default"
											onClick={action.onClick}
										>
											<span className="flex items-center gap-2">
												<ActionIcon className="h-4 w-4" />
												{action.label}
											</span>
											<ArrowRight className="h-4 w-4" />
										</Button>
									);
								})}
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}