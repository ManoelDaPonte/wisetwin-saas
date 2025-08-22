import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const containerId = searchParams.get("containerId");
    const organizationId = searchParams.get("organizationId");
    const userId = searchParams.get("userId") || session.user.id;

    if (!containerId) {
      return NextResponse.json(
        { error: "Container ID requis" },
        { status: 400 }
      );
    }

    // Vérifier les permissions
    if (userId !== session.user.id && organizationId) {
      const membership = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId,
          },
        },
      });

      if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
        return NextResponse.json(
          { error: "Accès non autorisé" },
          { status: 403 }
        );
      }
    }

    // Pour le moment, pas d'achievements (selon demande utilisateur)
    const achievements: any[] = [];

    return NextResponse.json(achievements);

  } catch (error) {
    console.error("Erreur lors de la récupération des achievements:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}