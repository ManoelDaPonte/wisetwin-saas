"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/hooks/use-translations";
import {
  registerSchema,
  isPasswordStrong,
  getPasswordRequirements,
} from "@/validators";
import { z } from "zod";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<z.ZodFormattedError<
    (typeof registerSchema)["_output"]
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);

    const formData = new FormData(event.currentTarget);
    const firstName = formData.get("firstName") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(t.auth.register.errors.passwordMismatch);
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
    const validationResult = registerSchema.safeParse({
      firstName,
      name,
      email,
      password,
    });

    if (!validationResult.success) {
      setFieldErrors(validationResult.error.format());
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          name,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.errors) {
          setFieldErrors(data.errors);
          return;
        }
        throw new Error(data.message || t.auth.register.errors.generalError);
      }

      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t.auth.register.errors.generalError);
      }
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
        <h1 className="text-2xl font-bold">{t.auth.register.title}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t.auth.register.subtitle}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="firstName">{t.auth.register.firstName}</Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder={t.auth.register.firstNamePlaceholder}
            required
            disabled={isLoading}
          />
          {fieldErrors?.firstName && (
            <p className="text-sm text-destructive">
              {fieldErrors.firstName._errors[0]}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="name">{t.auth.register.lastName}</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={t.auth.register.lastNamePlaceholder}
            required
            disabled={isLoading}
          />
          {fieldErrors?.name && (
            <p className="text-sm text-destructive">
              {fieldErrors.name._errors[0]}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">{t.auth.register.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t.auth.register.emailPlaceholder}
            required
            disabled={isLoading}
          />
          {fieldErrors?.email && (
            <p className="text-sm text-destructive">
              {fieldErrors.email._errors[0]}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">{t.auth.register.password}</Label>
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
          <Label htmlFor="confirmPassword">{t.auth.register.confirmPassword}</Label>
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
          {isLoading ? t.auth.register.creatingInProgress : t.auth.register.createButton}
        </Button>
      </div>
      <div className="text-center text-sm">
        {t.auth.register.hasAccount}{" "}
        <a href="/login" className="underline underline-offset-4">
          {t.auth.register.signIn}
        </a>
      </div>
    </form>
  );
}
