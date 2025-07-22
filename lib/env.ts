import { z } from "zod"

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1),
  
  // Azure Storage
  AZURE_STORAGE_CONNECTION_STRING: z.string().min(1),
  
  // Email
  EMAIL_PASSWORD: z.string().min(1),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

// Parse et valider les variables d'environnement
const envParsed = envSchema.safeParse(process.env)

if (!envParsed.success) {
  console.error("❌ Invalid environment variables:", envParsed.error.flatten().fieldErrors)
  throw new Error("Invalid environment variables")
}

export const env = envParsed.data

// Export du type pour l'autocomplétion
export type Env = z.infer<typeof envSchema>