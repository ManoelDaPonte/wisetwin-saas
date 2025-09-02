"use client";

import { useOrganizationStore } from "@/stores/organization-store";
import { GeneralSettings } from "./components/general-settings";
import { DangerZone } from "./components/danger-zone";
import { LeaveOrganization } from "./components/leave-organization";
import { useOrganizationSettings } from "../hooks/use-organization-settings";
import { useLeaveOrganization } from "../hooks/use-leave-organization";
import { useTranslations } from "@/hooks/use-translations";

export default function SettingsPage() {
	const t = useTranslations();
	const { activeOrganization } = useOrganizationStore();
	const {
		updateOrganization,
		deleteOrganization,
		transferOwnership,
		isUpdating,
		isDeleting,
		isTransferring,
	} = useOrganizationSettings();
	const { leaveOrganization, isLeaving } = useLeaveOrganization();

	if (!activeOrganization) {
		return null;
	}

	const canEdit =
		activeOrganization.role === "OWNER" ||
		activeOrganization.role === "ADMIN";
	const isOwner = activeOrganization.role === "OWNER";
	const canLeave = activeOrganization.role !== "OWNER";

	return (
		<div className="container mx-auto py-8 space-y-8 max-w-4xl">
			<div>
				<h1 className="text-3xl font-bold">
					{t.organizationSettings.title}
				</h1>
				<p className="text-muted-foreground">
					{t.organizationSettings.subtitle}{" "}
					{activeOrganization.name}
				</p>
			</div>

			<GeneralSettings
				organizationName={activeOrganization.name}
				organizationDescription={activeOrganization.description}
				canEdit={canEdit}
				isUpdating={isUpdating}
				onUpdate={updateOrganization}
			/>

			<LeaveOrganization
				canLeave={canLeave}
				organizationName={activeOrganization.name}
				onLeave={leaveOrganization}
				isLeaving={isLeaving}
			/>

			<DangerZone
				isOwner={isOwner}
				organizationName={activeOrganization.name}
				onDelete={deleteOrganization}
				onTransfer={(newOwnerId) => transferOwnership({ newOwnerId })}
				isDeleting={isDeleting}
				isTransferring={isTransferring}
			/>
		</div>
	);
}
