"use client";

import { useState } from "react";
import { useAdminOrganizations } from "../hooks/use-admin-organizations";
import {
	AdminTable,
	AdminTableColumn,
	AdminTableAction,
} from "../components/admin-table";
import { AdminOrganization } from "@/lib/admin/organizations";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Trash2, Building2, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { EditOrganizationDialog } from "../components/edit-organization-dialog";
import { useTranslations } from "@/hooks/use-translations";

export default function AdminOrganizationsPage() {
	const t = useTranslations();
	const { data, isLoading, error, refetch } = useAdminOrganizations();
	const [editingOrganization, setEditingOrganization] = useState<AdminOrganization | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const columns: AdminTableColumn<AdminOrganization>[] = [
		{
			key: "organization",
			label: t.admin.organizations.table.organization,
			render: (org) => (
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8">
						<AvatarFallback>
							<Building2 className="h-4 w-4" />
						</AvatarFallback>
					</Avatar>
					<div>
						<div className="font-medium">{org.name}</div>
						{org.description && (
							<div className="text-sm text-muted-foreground line-clamp-1">
								{org.description}
							</div>
						)}
					</div>
				</div>
			),
		},
		{
			key: "owner",
			label: t.admin.organizations.table.owner,
			render: (org) => (
				<div>
					<div className="font-medium">
						{org.owner.name || t.admin.organizations.table.noName}
					</div>
					<div className="text-sm text-muted-foreground">
						{org.owner.email}
					</div>
				</div>
			),
		},
		{
			key: "membersCount",
			label: t.admin.organizations.table.members,
			render: (org) => (
				<Badge variant="outline">{org.membersCount}</Badge>
			),
		},
		{
			key: "buildsCount",
			label: t.admin.organizations.table.trainings,
			render: (org) => <Badge variant="outline">{org.buildsCount}</Badge>,
		},
		{
			key: "invitationsCount",
			label: t.admin.organizations.table.invitations,
			render: (org) => (
				<Badge
					variant={org.invitationsCount > 0 ? "default" : "secondary"}
				>
					{org.invitationsCount}
				</Badge>
			),
		},
		{
			key: "azureContainerId",
			label: t.admin.organizations.table.containerId,
			render: (org) => (
				<code className="text-xs bg-muted px-2 py-1 rounded">
					{org.azureContainerId}
				</code>
			),
		},
		{
			key: "createdAt",
			label: t.admin.organizations.table.created,
			render: (org) => (
				<span className="text-sm text-muted-foreground">
					{formatDistanceToNow(new Date(org.createdAt), {
						addSuffix: true,
						locale: fr,
					})}
				</span>
			),
		},
	];

	const actions: AdminTableAction<AdminOrganization>[] = [
		{
			label: t.admin.organizations.actions.edit,
			icon: <Edit className="h-4 w-4 mr-1" />,
			onClick: (org) => {
				setEditingOrganization(org);
				setEditDialogOpen(true);
			},
			variant: "outline",
		},
		{
			label: t.admin.organizations.actions.contactOwner,
			icon: <Mail className="h-4 w-4 mr-1" />,
			onClick: (org) => {
				window.open(`mailto:${org.owner.email}`, "_blank");
			},
			variant: "ghost",
		},
		{
			label: t.admin.organizations.actions.delete,
			icon: <Trash2 className="h-4 w-4 mr-1" />,
			onClick: (org) => {
				console.log("Supprimer organisation:", org);
				// TODO: Modal de confirmation + suppression
			},
			variant: "destructive",
		},
	];

	return (
		<div className="h-full flex flex-col">
			<AdminTable
				data={data?.organizations || []}
				columns={columns}
				actions={actions}
				isLoading={isLoading}
				error={error}
				title={t.admin.organizations.title}
				description={t.admin.organizations.subtitle}
				searchPlaceholder={t.admin.organizations.searchPlaceholder}
				itemsPerPage={15}
				emptyMessage={t.admin.organizations.emptyMessage}
			/>

			<EditOrganizationDialog
				organization={editingOrganization}
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				onUpdate={() => {
					refetch();
					setEditingOrganization(null);
				}}
			/>
		</div>
	);
}
