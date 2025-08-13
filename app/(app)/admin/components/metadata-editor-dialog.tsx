// app/(app)/admin/components/metadata-editor-dialog.tsx - Version avec modale plus grande
"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdminFormation } from "@/lib/admin/formations";
import { MetadataEditor } from "./metadata-editor";
import { useFormationMetadata } from "../hooks/use-formation-metadata";
import { Loader2, FileText, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MetadataEditorDialogProps {
	formation: AdminFormation;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function MetadataEditorDialog({
	formation,
	open,
	onOpenChange,
}: MetadataEditorDialogProps) {
	const [hasCreatedDefault, setHasCreatedDefault] = useState(false);

	const {
		data: metadataResponse,
		isLoading,
		error,
		createDefaultMetadata,
		isCreating,
		createError,
		createSuccess,
	} = useFormationMetadata({
		containerId: formation.containerId,
		buildType: formation.buildType,
		buildName: formation.name,
	});

	const handleCreateDefault = () => {
		createDefaultMetadata();
		setHasCreatedDefault(true);
	};

	const handleClose = () => {
		onOpenChange(false);
		setHasCreatedDefault(false);
	};

	if (createSuccess && hasCreatedDefault) {
		// Recharger automatiquement après création
		setHasCreatedDefault(false);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-7xl max-h-[95vh] w-[95vw] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Métadonnées - {formation.name}
					</DialogTitle>
					<DialogDescription>
						{formation.containerType === "organization"
							? `Organisation: ${formation.organizationName}`
							: `Utilisateur: ${formation.userEmail}`}{" "}
						• Type: {formation.buildType}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{isLoading && (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin mr-2" />
							Chargement des métadonnées...
						</div>
					)}

					{error && (
						<Alert variant="destructive">
							<AlertDescription>
								Erreur: {error.message}
							</AlertDescription>
						</Alert>
					)}

					{createError && (
						<Alert variant="destructive">
							<AlertDescription>
								Erreur lors de la création:{" "}
								{createError.message}
							</AlertDescription>
						</Alert>
					)}

					{!isLoading && !error && metadataResponse && (
						<>
							{!metadataResponse.exists ? (
								<div className="text-center py-8 space-y-4">
									<div className="text-muted-foreground">
										Aucun fichier de métadonnées trouvé pour
										cette formation.
									</div>
									<Button
										onClick={handleCreateDefault}
										disabled={isCreating}
										className="gap-2"
									>
										{isCreating ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Plus className="h-4 w-4" />
										)}
										Créer les métadonnées par défaut
									</Button>
								</div>
							) : metadataResponse.error ? (
								<Alert variant="destructive">
									<AlertDescription>
										Fichier corrompu:{" "}
										{metadataResponse.error}
									</AlertDescription>
								</Alert>
							) : metadataResponse.metadata ? (
								<MetadataEditor
									formation={formation}
									initialMetadata={metadataResponse.metadata}
									onSaveSuccess={handleClose}
								/>
							) : null}
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
