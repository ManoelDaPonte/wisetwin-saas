"use client";

import { useEffect } from "react";
import { useOrganizationStore } from "@/stores/organization-store";
import { useOrganizations } from "@/app/hooks/use-organizations";
import { useMembers } from "./hooks/use-members";
import { useBuilds } from "@/app/hooks/use-builds";
import { OrganizationStats } from "./components/organization-stats";
import { OrganizationActions } from "./components/organization-actions";
import { useTranslations } from "@/hooks/use-translations";

export default function OrganizationPage() {
	const t = useTranslations();
	const { activeOrganization } = useOrganizationStore();
	const { fetchOrganizations } = useOrganizations();

	const { members, isLoading: isMembersLoading } = useMembers();
	const { data: wisetourBuilds, isLoading: isWisetourLoading } =
		useBuilds("wisetour");
	const { data: wisetrainerBuilds, isLoading: isWisetrainerLoading } =
		useBuilds("wisetrainer");

	// Rafraîchir les données des organisations au montage du composant
	useEffect(() => {
		fetchOrganizations();
	}, [fetchOrganizations]);

	if (!activeOrganization) {
		return null;
	}

	const memberCount = members?.length || 0;
	const maxUsers = activeOrganization.maxUsers || 1;
	const wisetourCount = wisetourBuilds?.builds?.length || 0;
	const wisetrainerCount = wisetrainerBuilds?.builds?.length || 0;

	// Vérifier si l'utilisateur est un membre (pas admin/owner)
	const isMember = activeOrganization.role === "MEMBER";

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">
					{t.organization.overview.title}
				</h1>
				<p className="text-muted-foreground">
					{t.organization.overview.subtitle}{" "}
					{activeOrganization.name}
				</p>
			</div>

			{/* Statistiques rapides */}
			<OrganizationStats
				memberCount={memberCount}
				maxUsers={maxUsers}
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
