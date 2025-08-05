import { z } from "zod"

/**
 * Password-related schemas and validation functions
 */

// Password reset request schema
export const passwordResetSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
})

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(1, "La confirmation est requise"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

// New password schema (for password reset with token)
export const newPasswordSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(1, "La confirmation est requise"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

/**
 * Check if password meets strength requirements
 */
export const isPasswordStrong = (password: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const isLongEnough = password.length >= 8
  
  return hasUpperCase && hasLowerCase && hasNumber && isLongEnough
}

/**
 * Password strength requirements message
 */
export const getPasswordRequirements = (): string => {
  return "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"
}

// Type exports
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
export type NewPasswordInput = z.infer<typeof newPasswordSchema>