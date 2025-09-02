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
import { getDisplayName, getUserInitials } from "@/lib/user-utils";
import { useTranslations } from "@/hooks/use-translations";

export default function AdminUsersPage() {
	const t = useTranslations();
	const { data, isLoading, error } = useAdminUsers();

	const columns: AdminTableColumn<AdminUser>[] = [
		{
			key: "user",
			label: t.admin.users.table.user,
			render: (user) => (
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8">
						<AvatarImage
							src={user.image}
							alt={getDisplayName(user)}
						/>
						<AvatarFallback>
							{getUserInitials(user)}
						</AvatarFallback>
					</Avatar>
					<div>
						<div className="font-medium">
							{getDisplayName(user)}
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
			label: t.admin.users.table.emailVerified,
			render: (user) => (
				<Badge variant={user.emailVerified ? "default" : "destructive"}>
					{user.emailVerified ? t.admin.users.table.verified : t.admin.users.table.notVerified}
				</Badge>
			),
		},
		{
			key: "organizationsCount",
			label: t.admin.users.table.organizations,
			render: (user) => (
				<Badge variant="outline">{user.organizationsCount}</Badge>
			),
		},
		{
			key: "buildsCount",
			label: t.admin.users.table.followedTrainings,
			render: (user) => (
				<Badge variant="outline">{user.buildsCount}</Badge>
			),
		},
		{
			key: "azureContainerId",
			label: t.admin.users.table.container,
			render: (user) => (
				<Badge
					variant={user.azureContainerId ? "default" : "secondary"}
				>
					{user.azureContainerId ? t.admin.users.table.created : t.admin.users.table.none}
				</Badge>
			),
		},
		{
			key: "createdAt",
			label: t.admin.users.table.registered,
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
			label: t.admin.users.actions.contact,
			icon: <Mail className="h-4 w-4 mr-1" />,
			onClick: (user) => {
				window.open(`mailto:${user.email}`, "_blank");
			},
			variant: "ghost",
		},
		{
			label: t.admin.users.actions.delete,
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
				title={t.admin.users.title}
				description={t.admin.users.subtitle}
				searchPlaceholder={t.admin.users.searchPlaceholder}
				itemsPerPage={20}
				emptyMessage={t.admin.users.emptyMessage}
			/>
		</div>
	);
}
