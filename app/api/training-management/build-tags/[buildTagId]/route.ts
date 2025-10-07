import { NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";

// GET /api/training-management/build-tags/[buildTagId] - Récupérer un build-tag spécifique
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest, context?: unknown) => {
  try {
    const { buildTagId } = await (context as { params: Promise<{ buildTagId: string }> }).params;

    const buildTag = await prisma.buildTag.findFirst({
      where: {
        id: buildTagId,
        tag: {
          organizationId: request.organization.id,
        },
      },
      include: {
        tag: {
          select: {
            id: true,
            name: true,
            color: true,
            description: true,
            organizationId: true,
            _count: {
              select: {
                memberTags: true,
              },
            },
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!buildTag) {
      return NextResponse.json(
        { error: "Build-tag non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(buildTag);
  } catch (error) {
    console.error("Erreur lors de la récupération du build-tag:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération" },
      { status: 500 }
    );
  }
});

// PUT /api/training-management/build-tags/[buildTagId] - Mettre à jour un build-tag
export const PUT = withOrgAuth(async (request: OrgAuthenticatedRequest, context?: unknown) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour modifier ce build-tag" },
        { status: 403 }
      );
    }

    const { buildTagId } = await (context as { params: Promise<{ buildTagId: string }> }).params;

    // Vérifier que le build-tag existe et appartient à l'organisation
    const existingBuildTag = await prisma.buildTag.findFirst({
      where: {
        id: buildTagId,
        tag: {
          organizationId: request.organization.id,
        },
      },
      include: {
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!existingBuildTag) {
      return NextResponse.json(
        { error: "Build-tag non trouvé" },
        { status: 404 }
      );
    }

    const updatedBuildTag = await prisma.buildTag.update({
      where: { id: buildTagId },
      data: {
        // Note: BuildTag doesn't have dueDate, priority, status fields
        // These belong to TrainingTag model
      },
      include: {
        tag: {
          select: {
            id: true,
            name: true,
            color: true,
            description: true,
            _count: {
              select: {
                memberTags: true,
              },
            },
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBuildTag);
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour du build-tag:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour" },
      { status: 500 }
    );
  }
});

// DELETE /api/training-management/build-tags/[buildTagId] - Supprimer un build-tag
export const DELETE = withOrgAuth(async (request: OrgAuthenticatedRequest, context?: unknown) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour supprimer ce build-tag" },
        { status: 403 }
      );
    }

    const { buildTagId } = await (context as { params: Promise<{ buildTagId: string }> }).params;

    // Vérifier que le build-tag existe et appartient à l'organisation
    const existingBuildTag = await prisma.buildTag.findFirst({
      where: {
        id: buildTagId,
        tag: {
          organizationId: request.organization.id,
        },
      },
      include: {
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!existingBuildTag) {
      return NextResponse.json(
        { error: "Build-tag non trouvé" },
        { status: 404 }
      );
    }

    // Suppression du build-tag
    await prisma.buildTag.delete({
      where: { id: buildTagId },
    });

    return NextResponse.json({
      message: "Build-tag supprimé avec succès",
      build: {
        name: existingBuildTag.buildName,
        type: existingBuildTag.buildType,
      },
      tag: existingBuildTag.tag,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du build-tag:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression" },
      { status: 500 }
    );
  }
});