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
import { useTranslations } from "@/hooks/use-translations";

interface CreateOrganizationDialogProps {
	children?: React.ReactNode;
	onSuccess?: () => void;
}

export function CreateOrganizationDialog({
	children,
	onSuccess,
}: CreateOrganizationDialogProps) {
	const t = useTranslations();
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
			{t.createOrganizationDialog.triggerButton}
		</Button>
	);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<div onClick={() => setIsOpen(true)}>{trigger}</div>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{t.createOrganizationDialog.title}</DialogTitle>
						<DialogDescription>
							{t.createOrganizationDialog.description}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">
								{t.createOrganizationDialog.fields.name}
							</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={t.createOrganizationDialog.fields.namePlaceholder}
								required
								disabled={isLoading}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="description">
								{t.createOrganizationDialog.fields.description}
							</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder={t.createOrganizationDialog.fields.descriptionPlaceholder}
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
							{t.createOrganizationDialog.buttons.cancel}
						</Button>
						<Button
							type="submit"
							disabled={isLoading || !name.trim()}
						>
							{isLoading ? t.createOrganizationDialog.buttons.creating : t.createOrganizationDialog.buttons.create}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
