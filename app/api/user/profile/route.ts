import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper"
import { updateProfileSchema } from "@/lib/validators"

export const PATCH = withAuth(async (request: AuthenticatedRequest) => {
  try {

    const body = await request.json()
    
    // Valider les données avec le schéma
    const validation = updateProfileSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { name } = validation.data
    
    if (!name) {
      return NextResponse.json(
        { error: "Aucune donnée à mettre à jour" },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: request.user.id },
      data: { name },
      select: { id: true, name: true, email: true }
    })

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    )
  }
})