"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginSchema } from "@/validators";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const invitationToken = searchParams.get("invitation");

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(event.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		// Valider les données
		const validation = loginSchema.safeParse({ email, password });
		if (!validation.success) {
			setError(validation.error.errors[0].message);
			setIsLoading(false);
			return;
		}

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError("Email ou mot de passe incorrect");
				return;
			}

			// Si on a un token d'invitation, rediriger vers la page d'invitation
			if (invitationToken) {
				router.push(`/invitation/${invitationToken}`);
			} else {
				router.push("/");
			}
			router.refresh();
		} catch {
			setError("Une erreur est survenue. Veuillez réessayer.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<form
			onSubmit={onSubmit}
			className={cn("flex flex-col gap-6", className)}
			{...props}
		>
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-2xl font-bold">Connexion à votre compte</h1>
				<p className="text-muted-foreground text-sm text-balance">
					Entrez votre email pour vous connecter à votre compte
				</p>
			</div>

			{invitationToken && (
				<Alert>
					<AlertDescription>
						Connectez-vous pour accepter votre invitation à
						rejoindre une organisation.
					</AlertDescription>
				</Alert>
			)}

			<div className="grid gap-6">
				<div className="grid gap-3">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="exemple@email.com"
						required
						disabled={isLoading}
					/>
				</div>
				<div className="grid gap-3">
					<div className="flex items-center">
						<Label htmlFor="password">Mot de passe</Label>
						<a
							href="#"
							className="ml-auto text-sm underline-offset-4 hover:underline"
						>
							Mot de passe oublié ?
						</a>
					</div>
					<Input
						id="password"
						name="password"
						type="password"
						required
						disabled={isLoading}
					/>
				</div>
				{error && (
					<div className="text-destructive text-sm">{error}</div>
				)}
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Connexion en cours..." : "Se connecter"}
				</Button>
			</div>
			<div className="text-center text-sm">
				Vous n&apos;avez pas de compte ?{" "}
				<a href="/register" className="underline underline-offset-4">
					S&apos;inscrire
				</a>
			</div>
		</form>
	);
}
