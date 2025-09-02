import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      )
    }

    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code d'invitation requis" },
        { status: 400 }
      )
    }

    // Rechercher l'invitation avec le code
    const invitation = await prisma.organizationInvitation.findUnique({
      where: {
        code: code.toUpperCase(),
      },
      include: {
        organization: true,
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Code d'invitation invalide" },
        { status: 404 }
      )
    }

    // Vérifier si l'invitation a expiré
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Code d'invitation expiré" },
        { status: 400 }
      )
    }

    // Vérifier si l'invitation est déjà utilisée
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Code d'invitation déjà utilisé" },
        { status: 400 }
      )
    }

    // SÉCURITÉ: Vérifier que l'utilisateur connecté correspond à l'email invité
    if (invitation.email !== session.user.email) {
      return NextResponse.json(
        { error: "Cette invitation n'est pas destinée à votre compte" },
        { status: 403 }
      )
    }

    // Vérifier si l'utilisateur est déjà membre de l'organisation
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: invitation.organizationId,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "Vous êtes déjà membre de cette organisation" },
        { status: 400 }
      )
    }


    // Ajouter l'utilisateur à l'organisation
    await prisma.organizationMember.create({
      data: {
        organizationId: invitation.organizationId,
        userId: session.user.id,
        role: invitation.role,
      },
    })

    // Marquer l'invitation comme acceptée
    await prisma.organizationInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    })

    return NextResponse.json({
      success: true,
      organization: {
        id: invitation.organization.id,
        name: invitation.organization.name,
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}