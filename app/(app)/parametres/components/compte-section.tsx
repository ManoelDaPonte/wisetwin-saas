"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { useUserActions } from "../hooks/use-user-actions";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
	updateProfileSchema,
	passwordChangeSchema,
	isPasswordStrong,
	getPasswordRequirements,
} from "@/validators";

export function CompteSection() {
	const { data: session, update } = useSession();
	const { updateUser, changePassword, isLoading } = useUserActions();
	const [firstName, setFirstName] = useState(session?.user?.firstName || "");
	const [username, setUsername] = useState(session?.user?.name || "");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	useEffect(() => {
		if (session?.user?.firstName) {
			setFirstName(session.user.firstName);
		}
		if (session?.user?.name) {
			setUsername(session.user.name);
		}
	}, [session]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Compte</CardTitle>
				<CardDescription>
					Gérez vos informations de compte
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="firstName">Prénom</Label>
						<div className="flex gap-2">
							<Input
								id="firstName"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								placeholder="Votre prénom"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="username">Nom</Label>
						<div className="flex gap-2">
							<Input
								id="username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Votre nom"
							/>
						</div>
					</div>
					<Button
						onClick={async () => {
							// Valider les données
							const validation =
								updateProfileSchema.safeParse({
									firstName: firstName,
									name: username,
								});
							if (!validation.success) {
								toast.error(
									validation.error.errors[0].message
								);
								return;
							}

							try {
								await updateUser({ 
									firstName: firstName, 
									name: username 
								});
								// Rafraîchir la session pour obtenir les nouvelles données
								await update();
								toast.success(
									"Informations mises à jour avec succès"
								);
							} catch (error) {
								toast.error(
									error instanceof Error
										? error.message
										: "Erreur lors de la mise à jour"
								);
							}
						}}
						disabled={
							isLoading || 
							(firstName === session?.user?.firstName && username === session?.user?.name)
						}
						className="w-fit"
					>
						<Save className="h-4 w-4 mr-2" />
						Sauvegarder
					</Button>
				</div>

				<Separator />

				<div className="space-y-4">
					<h3 className="font-medium">Changer le mot de passe</h3>
					<div className="space-y-2">
						<Label htmlFor="current-password">
							Mot de passe actuel
						</Label>
						<Input
							id="current-password"
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							placeholder="Entrez votre mot de passe actuel"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="new-password">
							Nouveau mot de passe
						</Label>
						<Input
							id="new-password"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder="Entrez votre nouveau mot de passe"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirm-password">
							Confirmer le nouveau mot de passe
						</Label>
						<Input
							id="confirm-password"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Confirmez votre nouveau mot de passe"
						/>
					</div>
					<Button
						onClick={async () => {
							// Valider avec le schéma
							const validation = passwordChangeSchema.safeParse({
								currentPassword,
								newPassword,
								confirmPassword,
							});

							if (!validation.success) {
								toast.error(validation.error.errors[0].message);
								return;
							}

							// Vérifier la force du mot de passe
							if (!isPasswordStrong(newPassword)) {
								toast.error(getPasswordRequirements());
								return;
							}

							try {
								await changePassword({
									currentPassword,
									newPassword,
								});
								toast.success(
									"Mot de passe changé avec succès"
								);
								setCurrentPassword("");
								setNewPassword("");
								setConfirmPassword("");
							} catch (error) {
								toast.error(
									error instanceof Error
										? error.message
										: "Erreur lors du changement de mot de passe"
								);
							}
						}}
						disabled={
							isLoading ||
							!currentPassword ||
							!newPassword ||
							!confirmPassword
						}
					>
						Changer le mot de passe
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
