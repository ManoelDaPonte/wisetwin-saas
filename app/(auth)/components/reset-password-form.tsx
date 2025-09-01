"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resetPasswordSchema,
  isPasswordStrong,
  getPasswordRequirements,
} from "@/validators";
import { z } from "zod";

interface ResetPasswordFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function ResetPasswordForm({
  className,
  ...props
}: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<z.ZodFormattedError<
    (typeof resetPasswordSchema)["_output"]
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Token manquant. Veuillez utiliser le lien reçu par email.");
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (!token) {
      setError("Token manquant");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    // Check password strength with business logic
    if (!isPasswordStrong(password)) {
      setError(getPasswordRequirements());
      setIsLoading(false);
      return;
    }

    // Validation côté client
    const validationResult = resetPasswordSchema.safeParse({
      token,
      password,
    });

    if (!validationResult.success) {
      setFieldErrors(validationResult.error.format());
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
          return;
        }
        throw new Error(data.message || "Une erreur est survenue");
      }

      setIsSuccess(true);
      // Redirection après 3 secondes
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Mot de passe réinitialisé</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
          </p>
        </div>
        <div className="text-center text-sm">
          <a href="/login" className="underline underline-offset-4">
            Se connecter maintenant
          </a>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Lien invalide</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Le lien de réinitialisation est invalide ou manquant.
          </p>
        </div>
        <div className="text-center text-sm">
          <a href="/forgot-password" className="underline underline-offset-4">
            Demander un nouveau lien
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Saisissez votre nouveau mot de passe
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={isLoading}
          />
          {fieldErrors?.password && (
            <p className="text-sm text-destructive">
              {fieldErrors.password._errors[0]}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {getPasswordRequirements()}
          </p>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            disabled={isLoading}
          />
        </div>
        {error && <div className="text-destructive text-sm">{error}</div>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
        </Button>
      </div>
      <div className="text-center text-sm">
        <a href="/login" className="underline underline-offset-4">
          Retour à la connexion
        </a>
      </div>
    </form>
  );
}