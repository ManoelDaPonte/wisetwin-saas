"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/hooks/use-translations";
import { forgotPasswordSchema } from "@/validators";
import { z } from "zod";

interface ForgotPasswordFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function ForgotPasswordForm({
  className,
  ...props
}: ForgotPasswordFormProps) {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<z.ZodFormattedError<
    (typeof forgotPasswordSchema)["_output"]
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    // Validation côté client
    const validationResult = forgotPasswordSchema.safeParse({
      email,
    });

    if (!validationResult.success) {
      setFieldErrors(validationResult.error.format());
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
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
          <h1 className="text-2xl font-bold">{t.auth.forgotPassword.success.title}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t.auth.forgotPassword.success.message}
          </p>
        </div>
        <div className="text-center text-sm">
          <a href="/login" className="underline underline-offset-4">
            {t.auth.forgotPassword.success.backToLogin}
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
        <h1 className="text-2xl font-bold">{t.auth.forgotPassword.title}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t.auth.forgotPassword.subtitle}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">{t.auth.forgotPassword.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t.auth.forgotPassword.emailPlaceholder}
            required
            disabled={isLoading}
          />
          {fieldErrors?.email && (
            <p className="text-sm text-destructive">
              {fieldErrors.email._errors[0]}
            </p>
          )}
        </div>
        {error && <div className="text-destructive text-sm">{error}</div>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t.auth.forgotPassword.sendingInProgress : t.auth.forgotPassword.sendButton}
        </Button>
      </div>
      <div className="text-center text-sm">
        {t.auth.forgotPassword.rememberPassword}{" "}
        <a href="/login" className="underline underline-offset-4">
          {t.auth.forgotPassword.backToLogin}
        </a>
      </div>
    </form>
  );
}