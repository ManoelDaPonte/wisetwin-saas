import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper"
import { validatePassword } from "@/lib/validators"

export const PATCH = withAuth(async (request: AuthenticatedRequest) => {
  try {

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Les mots de passe sont requis" },
        { status: 400 }
      )
    }

    // Validation de la complexité du mot de passe
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur avec son mot de passe actuel
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: { password: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Le mot de passe actuel est incorrect" },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: request.user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ 
      success: true,
      message: "Mot de passe mis à jour avec succès" 
    })
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error)
    return NextResponse.json(
      { error: "Erreur lors du changement de mot de passe" },
      { status: 500 }
    )
  }
})