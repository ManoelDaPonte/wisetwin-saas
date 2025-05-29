import { z } from "zod"

/**
 * Authentication validators and schemas
 * Contains both Zod schemas and business logic for authentication
 */

// ============================================================================
// Zod Schemas
// ============================================================================

// Basic user schema that can be extended
export const userSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
  name: z.string().optional(),
})

// Registration schema with all required fields
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z
    .string()
    .email("Email invalide")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
})

// Login schema with minimal validation
export const loginSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
  password: z.string().min(1, "Le mot de passe est requis"),
})

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

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>

// ============================================================================
// Business Logic
// ============================================================================

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
 * Check if user can request password reset
 */
export const canRequestPasswordReset = (lastResetDate: Date | null): boolean => {
  if (!lastResetDate) return true
  
  const hoursSinceLastReset = 
    (Date.now() - lastResetDate.getTime()) / (1000 * 60 * 60)
  
  return hoursSinceLastReset >= 1 // Allow one reset per hour
}

/**
 * Validate if email domain is allowed (for corporate restrictions)
 */
export const isEmailDomainAllowed = (email: string, allowedDomains?: string[]): boolean => {
  if (!allowedDomains || allowedDomains.length === 0) return true
  
  const domain = email.split('@')[1]
  return allowedDomains.includes(domain)
}

/**
 * Check if account can be created (rate limiting)
 */
export const canCreateAccount = (
  ipAddress: string, 
  recentAttempts: { ip: string; timestamp: Date }[]
): boolean => {
  const maxAttemptsPerHour = 3
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  
  const recentAttemptsFromIP = recentAttempts.filter(
    attempt => attempt.ip === ipAddress && attempt.timestamp > oneHourAgo
  )
  
  return recentAttemptsFromIP.length < maxAttemptsPerHour
}

/**
 * Password strength requirements message
 */
export const getPasswordRequirements = (): string => {
  return "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"
}