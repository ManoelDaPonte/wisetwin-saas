import { NextResponse } from "next/server"
import { UserService } from "@/lib/services/user.service"
import { registerSchema } from "@/lib/validators/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Valider les données avec Zod
    const validationResult = registerSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: "Données invalides",
          errors: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }
    
    const { name, email, password } = validationResult.data

    try {
      await UserService.createUser({ name, email, password })
    } catch (userError) {
      if (userError instanceof Error && userError.message === "Un compte existe déjà avec cet email") {
        return NextResponse.json(
          { message: userError.message },
          { status: 400 }
        )
      }
      throw userError
    }

    return NextResponse.json(
      { message: "Compte créé avec succès" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    )
  }
} 