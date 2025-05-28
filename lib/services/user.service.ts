import { prisma } from "@/lib/prisma"
import { createUserContainer } from "@/lib/azure"
import { hash } from "bcryptjs"

export interface CreateUserInput {
  name: string
  email: string
  password: string
}

export class UserService {
  static async createUser(input: CreateUserInput) {
    const { name, email, password } = input

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new Error("Un compte existe déjà avec cet email")
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // Créer le container Azure personnel
    try {
      const containerId = await createUserContainer(user.email, user.id)
      await prisma.user.update({
        where: { id: user.id },
        data: { azureContainerId: containerId },
      })
    } catch (azureError) {
      console.error("Failed to create Azure container:", azureError)
      // On continue quand même, le container pourra être créé plus tard
    }

    return user
  }

  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        azureContainerId: true,
        organizations: true,
      },
    })
  }

  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  }
}