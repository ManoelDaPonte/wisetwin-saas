"use client";

import { useAdminOrganizations } from "../hooks/use-admin-organizations";
import {
	AdminTable,
	AdminTableColumn,
	AdminTableAction,
} from "../components/admin-table";
import { AdminOrganization } from "@/lib/admin/organizations";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Trash2, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminOrganizationsPage() {
	const { data, isLoading, error } = useAdminOrganizations();

	const columns: AdminTableColumn<AdminOrganization>[] = [
		{
			key: "organization",
			label: "Organisation",
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
			label: "Propriétaire",
			render: (org) => (
				<div>
					<div className="font-medium">
						{org.owner.name || "Sans nom"}
					</div>
					<div className="text-sm text-muted-foreground">
						{org.owner.email}
					</div>
				</div>
			),
		},
		{
			key: "membersCount",
			label: "Membres",
			render: (org) => (
				<Badge variant="outline">{org.membersCount}</Badge>
			),
		},
		{
			key: "buildsCount",
			label: "Formations",
			render: (org) => <Badge variant="outline">{org.buildsCount}</Badge>,
		},
		{
			key: "invitationsCount",
			label: "Invitations",
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
			label: "Container ID",
			render: (org) => (
				<code className="text-xs bg-muted px-2 py-1 rounded">
					{org.azureContainerId.length > 20
						? `${org.azureContainerId.substring(0, 20)}...`
						: org.azureContainerId}
				</code>
			),
		},
		{
			key: "createdAt",
			label: "Créée",
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
			label: "Contact owner",
			icon: <Mail className="h-4 w-4 mr-1" />,
			onClick: (org) => {
				window.open(`mailto:${org.owner.email}`, "_blank");
			},
			variant: "ghost",
		},
		{
			label: "Supprimer",
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
				title="Toutes les organisations"
				description="Superviser et gérer les organisations et leurs membres"
				searchPlaceholder="Rechercher une organisation..."
				itemsPerPage={15}
				emptyMessage="Aucune organisation trouvée"
			/>
		</div>
	);
}
