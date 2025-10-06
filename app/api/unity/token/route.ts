import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper";
import { generateUnityToken } from "@/lib/unity-token";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/unity/token - Génère un token pour Unity
 *
 * Paramètres query:
 * - containerId: ID du container Azure
 * - buildName: Nom du build
 * - buildType: Type du build (wisetour/wisetrainer)
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const containerId = searchParams.get("containerId");
    const buildName = searchParams.get("buildName");
    const buildType = searchParams.get("buildType");

    // Validation des paramètres
    if (!containerId || !buildName || !buildType) {
      return NextResponse.json({
        error: "containerId, buildName et buildType sont requis"
      }, { status: 400 });
    }

    // Vérifier l'accès au container
    let organizationId: string | undefined;

    if (containerId.startsWith("personal-")) {
      // Container personnel
      if (req.user.azureContainerId !== containerId) {
        return NextResponse.json({
          error: "Accès non autorisé au container personnel"
        }, { status: 403 });
      }
    } else {
      // Container d'organisation
      const org = await prisma.organization.findFirst({
        where: { azureContainerId: containerId }
      });

      if (!org) {
        return NextResponse.json({
          error: "Organisation non trouvée"
        }, { status: 404 });
      }

      const membership = await prisma.organizationMember.findFirst({
        where: {
          userId: req.user.id,
          organizationId: org.id
        }
      });

      if (!membership && org.ownerId !== req.user.id) {
        return NextResponse.json({
          error: "Non membre de l'organisation"
        }, { status: 403 });
      }

      organizationId = org.id;
    }

    // Générer le token
    const token = generateUnityToken({
      userId: req.user.id,
      containerId,
      buildName,
      buildType: buildType.toUpperCase(),
      organizationId
    });

    return NextResponse.json({
      token,
      expiresIn: 86400 // 24 heures en secondes
    });

  } catch (error) {
    console.error("Erreur lors de la génération du token Unity:", error);
    return NextResponse.json({
      error: "Erreur serveur"
    }, { status: 500 });
  }
});