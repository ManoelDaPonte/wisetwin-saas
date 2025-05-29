"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/app/lib/utils"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { registerSchema, isPasswordStrong, getPasswordRequirements } from "../utils/validators"
import { z } from "zod"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<z.ZodFormattedError<typeof registerSchema["_output"]> | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setFieldErrors(null)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    // Check password strength with business logic
    if (!isPasswordStrong(password)) {
      setError(getPasswordRequirements())
      setIsLoading(false)
      return
    }

    // Validation côté client
    const validationResult = registerSchema.safeParse({ name, email, password })
    
    if (!validationResult.success) {
      setFieldErrors(validationResult.error.format())
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.errors) {
          setFieldErrors(data.errors)
          return
        }
        throw new Error(data.message || "Une erreur est survenue")
      }

      router.push("/login")
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Créer un compte</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Remplissez les informations ci-dessous pour créer votre compte
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">Nom</Label>
          <Input 
            id="name" 
            name="name"
            type="text" 
            placeholder="Jean Dupont" 
            required 
            disabled={isLoading}
          />
          {fieldErrors?.name && (
            <p className="text-sm text-destructive">{fieldErrors.name._errors[0]}</p>
          )}
        </div>
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
          {fieldErrors?.email && (
            <p className="text-sm text-destructive">{fieldErrors.email._errors[0]}</p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Mot de passe</Label>
          <Input 
            id="password" 
            name="password"
            type="password" 
            required 
            disabled={isLoading}
          />
          {fieldErrors?.password && (
            <p className="text-sm text-destructive">{fieldErrors.password._errors[0]}</p>
          )}
          <p className="text-xs text-muted-foreground">{getPasswordRequirements()}</p>
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
        {error && (
          <div className="text-destructive text-sm">{error}</div>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Création en cours..." : "Créer un compte"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Vous avez déjà un compte ?{" "}
        <a href="/login" className="underline underline-offset-4">
          Se connecter
        </a>
      </div>
    </form>
  )
} 