"use client";

import React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrganizations } from "@/app/hooks/use-organizations";
import { useOrganizationStore } from "@/stores/organization-store";
import { Plus } from "lucide-react";

interface CreateOrganizationDialogProps {
	children?: React.ReactNode;
	onSuccess?: () => void;
}

export function CreateOrganizationDialog({
	children,
	onSuccess,
}: CreateOrganizationDialogProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [name, setName] = React.useState("");
	const [description, setDescription] = React.useState("");
	const { createOrganization, isLoading, error } = useOrganizations();
	const { switchToOrganization } = useOrganizationStore();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const newOrg = await createOrganization(name, description);
			switchToOrganization(newOrg);
			setIsOpen(false);
			setName("");
			setDescription("");
			onSuccess?.();
		} catch {
			// Error is already handled in the hook
		}
	};

	const trigger = children || (
		<Button size="sm" className="gap-2">
			<Plus className="h-4 w-4" />
			Nouvelle organisation
		</Button>
	);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<div onClick={() => setIsOpen(true)}>{trigger}</div>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Créer une organisation</DialogTitle>
						<DialogDescription>
							Les organisations vous permettent de gérer vos
							équipes et de partager des ressources.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">
								Nom de l&apos;organisation
							</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Mon organisation"
								required
								disabled={isLoading}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="description">
								Description (optionnelle)
							</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Description de votre organisation..."
								rows={3}
								disabled={isLoading}
							/>
						</div>

						{error && (
							<p className="text-sm text-destructive">{error}</p>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsOpen(false)}
							disabled={isLoading}
						>
							Annuler
						</Button>
						<Button
							type="submit"
							disabled={isLoading || !name.trim()}
						>
							{isLoading ? "Création..." : "Créer l'organisation"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
