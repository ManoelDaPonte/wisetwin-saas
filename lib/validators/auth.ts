import { z } from "zod"

/**
 * Authentication-related schemas
 */

// Login schema with minimal validation
export const loginSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
  password: z.string().min(1, "Le mot de passe est requis"),
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

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>