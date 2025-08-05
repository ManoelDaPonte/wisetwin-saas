"use client";

import { useOrganizationStore } from "@/stores/organization-store";
import { useMembers } from "./hooks/use-members";
import { useBuilds } from "@/app/hooks/use-builds";
import { OrganizationStats } from "./components/organization-stats";
import { OrganizationActions } from "./components/organization-actions";

export default function OrganizationPage() {
	const { activeOrganization } = useOrganizationStore();

	const { members, isLoading: isMembersLoading } = useMembers();
	const { data: wisetourBuilds, isLoading: isWisetourLoading } =
		useBuilds("wisetour");
	const { data: wisetrainerBuilds, isLoading: isWisetrainerLoading } =
		useBuilds("wisetrainer");

	if (!activeOrganization) {
		return null;
	}

	const memberCount = members?.length || 0;
	const wisetourCount = wisetourBuilds?.builds?.length || 0;
	const wisetrainerCount = wisetrainerBuilds?.builds?.length || 0;

	// Vérifier si l'utilisateur est un membre (pas admin/owner)
	const isMember = activeOrganization.role === "MEMBER";

	return (
		<div className="container mx-auto py-8 space-y-8">
			<div>
				<h1 className="text-3xl font-bold">Vue d'ensemble</h1>
				<p className="text-muted-foreground">
					Tableau de bord de votre organisation{" "}
					{activeOrganization.name}
				</p>
			</div>

			{/* Statistiques rapides */}
			<OrganizationStats
				memberCount={memberCount}
				wisetourCount={wisetourCount}
				wisetrainerCount={wisetrainerCount}
				isMembersLoading={isMembersLoading}
				isWisetourLoading={isWisetourLoading}
				isWisetrainerLoading={isWisetrainerLoading}
			/>

			{/* Actions rapides - cachées pour les membres */}
			<OrganizationActions canManage={!isMember} />
		</div>
	);
}
