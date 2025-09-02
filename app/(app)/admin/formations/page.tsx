"use client";

import { useState } from "react";
import { useAdminFormations } from "../hooks/use-admin-formations";
import {
	AdminTable,
	AdminTableColumn,
	AdminTableAction,
} from "../components/admin-table";
import { AdminFormation } from "@/lib/admin/formations";
import { MetadataEditorDialog } from "../components/metadata-editor-dialog";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslations } from "@/hooks/use-translations";

export default function AdminFormationsPage() {
	const t = useTranslations();
	const { data, isLoading, error } = useAdminFormations();
	const [selectedFormation, setSelectedFormation] =
		useState<AdminFormation | null>(null);
	const [isEditorOpen, setIsEditorOpen] = useState(false);

	const columns: AdminTableColumn<AdminFormation>[] = [
		{
			key: "name",
			label: t.admin.trainings.table.formation,
			render: (formation) => (
				<div>
					<div className="font-medium">
						{formation.title || formation.name}
					</div>
					{formation.title && formation.title !== formation.name && (
						<div className="text-xs text-muted-foreground">
							ID: {formation.name}
						</div>
					)}
				</div>
			),
		},
		{
			key: "buildType",
			label: t.admin.trainings.table.type,
			render: (formation) => (
				<Badge
					variant={
						formation.buildType === "wisetrainer"
							? "default"
							: "secondary"
					}
				>
					{formation.buildType}
				</Badge>
			),
		},
		{
			key: "containerInfo",
			label: t.admin.trainings.table.container,
			render: (formation) => (
				<code className="text-xs bg-muted px-2 py-1 rounded">
					{formation.containerId}
				</code>
			),
		},
		{
			key: "owner",
			label: t.admin.trainings.table.organization,
			render: (formation) => (
				<div className="text-sm">
					{formation.containerType === "organization"
						? formation.organizationName
						: formation.userEmail}
				</div>
			),
		},
		{
			key: "lastModified",
			label: t.admin.trainings.table.lastModified,
			render: (formation) => (
				<span className="text-sm text-muted-foreground">
					{formation.lastModified
						? formatDistanceToNow(formation.lastModified, {
								addSuffix: true,
								locale: fr,
						  })
						: t.admin.trainings.table.unknown}
				</span>
			),
		},
		{
			key: "hasMetadata",
			label: t.admin.trainings.table.metadata,
			render: (formation) => (
				<Badge
					variant={formation.hasMetadata ? "default" : "destructive"}
				>
					{formation.hasMetadata ? t.admin.trainings.table.present : t.admin.trainings.table.missing}
				</Badge>
			),
		},
	];

	const actions: AdminTableAction<AdminFormation>[] = [
		{
			label: t.admin.trainings.actions.edit,
			icon: <Edit className="h-4 w-4 mr-1" />,
			onClick: (formation) => {
				setSelectedFormation(formation);
				setIsEditorOpen(true);
			},
			variant: "ghost",
		},
	];

	return (
		<div className="h-full flex flex-col">
			<AdminTable
				data={data?.formations || []}
				columns={columns}
				actions={actions}
				isLoading={isLoading}
				error={error}
				title={t.admin.trainings.title}
				description={t.admin.trainings.subtitle}
				searchPlaceholder={t.admin.trainings.searchPlaceholder}
				itemsPerPage={15}
				emptyMessage={t.admin.trainings.emptyMessage}
			/>

			{/* Metadata Editor */}
			{selectedFormation && (
				<MetadataEditorDialog
					formation={selectedFormation}
					open={isEditorOpen}
					onOpenChange={(open) => {
						setIsEditorOpen(open);
						if (!open) {
							setSelectedFormation(null);
						}
					}}
				/>
			)}
		</div>
	);
}
