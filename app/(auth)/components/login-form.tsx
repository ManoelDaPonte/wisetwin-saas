"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "@/hooks/use-translations";
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
	const t = useTranslations();
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
				setError(t.auth.login.errors.invalidCredentials);
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
			setError(t.auth.login.errors.generalError);
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
				<h1 className="text-2xl font-bold">{t.auth.login.title}</h1>
				<p className="text-muted-foreground text-sm text-balance">
					{t.auth.login.subtitle}
				</p>
			</div>

			{invitationToken && (
				<Alert>
					<AlertDescription>
						{t.auth.login.invitationMessage}
					</AlertDescription>
				</Alert>
			)}

			<div className="grid gap-6">
				<div className="grid gap-3">
					<Label htmlFor="email">{t.auth.login.email}</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder={t.auth.login.emailPlaceholder}
						required
						disabled={isLoading}
					/>
				</div>
				<div className="grid gap-3">
					<div className="flex items-center">
						<Label htmlFor="password">{t.auth.login.password}</Label>
						<a
							href="/forgot-password"
							className="ml-auto text-sm underline-offset-4 hover:underline"
						>
							{t.auth.login.forgotPassword}
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
					{isLoading ? t.auth.login.loginInProgress : t.auth.login.loginButton}
				</Button>
			</div>
			<div className="text-center text-sm">
				{t.auth.login.noAccount}{" "}
				<a href="/register" className="underline underline-offset-4">
					{t.auth.login.signUp}
				</a>
			</div>
		</form>
	);
}
