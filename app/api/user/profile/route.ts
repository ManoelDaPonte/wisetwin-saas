import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper"

export const PATCH = withAuth(async (request: AuthenticatedRequest) => {
  try {

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Le nom est requis" },
        { status: 400 }
      )
    }
    
    // Sanitize and limit name length
    const sanitizedName = name.trim().slice(0, 100)

    const updatedUser = await prisma.user.update({
      where: { id: request.user.id },
      data: { name: sanitizedName },
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