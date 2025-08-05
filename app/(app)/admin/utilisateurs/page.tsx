"use client";

import { useAdminUsers } from "../hooks/use-admin-users";
import {
	AdminTable,
	AdminTableColumn,
	AdminTableAction,
} from "../components/admin-table";
import { AdminUser } from "@/lib/admin/users";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminUsersPage() {
	const { data, isLoading, error } = useAdminUsers();

	const columns: AdminTableColumn<AdminUser>[] = [
		{
			key: "user",
			label: "Utilisateur",
			render: (user) => (
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8">
						<AvatarImage
							src={user.image}
							alt={user.name || user.email}
						/>
						<AvatarFallback>
							{user.name?.charAt(0).toUpperCase() ||
								user.email.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div>
						<div className="font-medium">
							{user.name || "Sans nom"}
						</div>
						<div className="text-sm text-muted-foreground">
							{user.email}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "emailVerified",
			label: "Email vérifié",
			render: (user) => (
				<Badge variant={user.emailVerified ? "default" : "destructive"}>
					{user.emailVerified ? "Vérifié" : "Non vérifié"}
				</Badge>
			),
		},
		{
			key: "organizationsCount",
			label: "Organisations",
			render: (user) => (
				<Badge variant="outline">{user.organizationsCount}</Badge>
			),
		},
		{
			key: "buildsCount",
			label: "Formations suivies",
			render: (user) => (
				<Badge variant="outline">{user.buildsCount}</Badge>
			),
		},
		{
			key: "azureContainerId",
			label: "Container",
			render: (user) => (
				<Badge
					variant={user.azureContainerId ? "default" : "secondary"}
				>
					{user.azureContainerId ? "Créé" : "Aucun"}
				</Badge>
			),
		},
		{
			key: "createdAt",
			label: "Inscrit",
			render: (user) => (
				<span className="text-sm text-muted-foreground">
					{formatDistanceToNow(new Date(user.createdAt), {
						addSuffix: true,
						locale: fr,
					})}
				</span>
			),
		},
	];

	const actions: AdminTableAction<AdminUser>[] = [
		{
			label: "Contact",
			icon: <Mail className="h-4 w-4 mr-1" />,
			onClick: (user) => {
				window.open(`mailto:${user.email}`, "_blank");
			},
			variant: "ghost",
		},
		{
			label: "Supprimer",
			icon: <Trash2 className="h-4 w-4 mr-1" />,
			onClick: (user) => {
				console.log("Supprimer utilisateur:", user);
				// TODO: Modal de confirmation + suppression
			},
			variant: "destructive",
		},
	];

	return (
		<div className="h-full flex flex-col">
			<AdminTable
				data={data?.users || []}
				columns={columns}
				actions={actions}
				isLoading={isLoading}
				error={error}
				title="Tous les utilisateurs"
				description="Gérer et superviser les comptes utilisateurs de la plateforme"
				searchPlaceholder="Rechercher un utilisateur..."
				itemsPerPage={20}
				emptyMessage="Aucun utilisateur trouvé"
			/>
		</div>
	);
}
