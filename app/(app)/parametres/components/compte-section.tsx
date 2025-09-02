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
import { useTranslations } from "@/hooks/use-translations";

export function CompteSection() {
	const t = useTranslations();
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
				<CardTitle>{t.settings.account.title}</CardTitle>
				<CardDescription>
					{t.settings.account.subtitle}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="firstName">{t.settings.account.firstName}</Label>
						<div className="flex gap-2">
							<Input
								id="firstName"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								placeholder={t.settings.account.firstNamePlaceholder}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="username">{t.settings.account.name}</Label>
						<div className="flex gap-2">
							<Input
								id="username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder={t.settings.account.namePlaceholder}
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
									t.settings.account.updateSuccess
								);
							} catch (error) {
								toast.error(
									error instanceof Error
										? error.message
										: t.settings.account.updateError
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
						{t.settings.account.save}
					</Button>
				</div>

				<Separator />

				<div className="space-y-4">
					<h3 className="font-medium">{t.settings.account.changePassword.title}</h3>
					<div className="space-y-2">
						<Label htmlFor="current-password">
							{t.settings.account.changePassword.current}
						</Label>
						<Input
							id="current-password"
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							placeholder={t.settings.account.changePassword.currentPlaceholder}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="new-password">
							{t.settings.account.changePassword.new}
						</Label>
						<Input
							id="new-password"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder={t.settings.account.changePassword.newPlaceholder}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirm-password">
							{t.settings.account.changePassword.confirm}
						</Label>
						<Input
							id="confirm-password"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder={t.settings.account.changePassword.confirmPlaceholder}
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
									t.settings.account.changePassword.success
								);
								setCurrentPassword("");
								setNewPassword("");
								setConfirmPassword("");
							} catch (error) {
								toast.error(
									error instanceof Error
										? error.message
										: t.settings.account.changePassword.error
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
						{t.settings.account.changePassword.button}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
