import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { deleteContainer } from "@/lib/azure"
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper"

export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: "Le mot de passe est requis pour supprimer le compte" },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur avec son mot de passe et ses containers Azure
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: { 
        password: true,
        azureContainerId: true,
        organizations: {
          select: {
            azureContainerId: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 400 }
      )
    }

    // Collecter tous les containers Azure à supprimer
    const containersToDelete: string[] = []
    
    // Container personnel de l'utilisateur
    if (user.azureContainerId) {
      containersToDelete.push(user.azureContainerId)
    }
    
    // Containers des organisations dont l'utilisateur est propriétaire
    user.organizations.forEach(org => {
      if (org.azureContainerId) {
        containersToDelete.push(org.azureContainerId)
      }
    })

    // Supprimer l'utilisateur et toutes ses données associées
    // Grâce aux cascades dans le schéma Prisma, cela supprimera aussi :
    // - Les organisations dont il est propriétaire
    // - Ses appartenances aux organisations (OrganizationMember)
    await prisma.user.delete({
      where: { id: request.user.id }
    })

    // Supprimer les containers Azure en parallèle
    // On le fait après la suppression en base pour éviter les incohérences
    await Promise.all(
      containersToDelete.map(containerId => deleteContainer(containerId))
    )

    return NextResponse.json({ 
      success: true,
      message: "Compte supprimé avec succès" 
    })
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte" },
      { status: 500 }
    )
  }
})