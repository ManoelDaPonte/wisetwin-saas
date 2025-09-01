import { z } from "zod"

/**
 * User-related schemas
 */

// Basic user schema that can be extended
export const userSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
  name: z.string().optional(),
})

// Profile update schema
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .optional(),
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .optional(),
  email: z
    .string()
    .email("Email invalide")
    .toLowerCase()
    .optional(),
})

// Type exports
export type UserInput = z.infer<typeof userSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>