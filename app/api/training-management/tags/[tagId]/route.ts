import { NextRequest, NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { UpdateTrainingTagSchema } from "@/validators/training";

// GET /api/training-management/tags/[tagId] - Récupérer un tag spécifique
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest, { params }: { params: Promise<{ tagId: string }> }) => {
  try {
    const { tagId } = await params;

    const tag = await prisma.trainingTag.findFirst({
      where: {
        id: tagId,
        organizationId: request.organization.id,
      },
      include: {
        _count: {
          select: {
            memberTags: true,
            buildTags: true,
          },
        },
        memberTags: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        buildTags: {
          include: {
            _count: {
              select: {
                completions: true,
              },
            },
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        { error: "Tag non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Erreur lors de la récupération du tag:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération du tag" },
      { status: 500 }
    );
  }
});

// PUT /api/training-management/tags/[tagId] - Mettre à jour un tag
export const PUT = withOrgAuth(async (request: OrgAuthenticatedRequest, { params }: { params: Promise<{ tagId: string }> }) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour modifier des tags" },
        { status: 403 }
      );
    }

    const { tagId } = await params;
    const body = await request.json();

    // Validation des données
    const validation = UpdateTrainingTagSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Vérification que le tag existe et appartient à l'organisation
    const existingTag = await prisma.trainingTag.findFirst({
      where: {
        id: tagId,
        organizationId: request.organization.id,
      },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: "Tag non trouvé" },
        { status: 404 }
      );
    }

    const updateData = validation.data;

    // Si le nom change, vérifier l'unicité
    if (updateData.name && updateData.name !== existingTag.name) {
      const nameConflict = await prisma.trainingTag.findFirst({
        where: {
          name: updateData.name,
          organizationId: request.organization.id,
          id: { not: tagId },
        },
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: "Un tag avec ce nom existe déjà dans cette organisation" },
          { status: 409 }
        );
      }
    }

    // Mise à jour du tag
    const updatedTag = await prisma.trainingTag.update({
      where: { id: tagId },
      data: updateData,
      include: {
        _count: {
          select: {
            memberTags: true,
            buildTags: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du tag:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour du tag" },
      { status: 500 }
    );
  }
});

// DELETE /api/training-management/tags/[tagId] - Supprimer un tag
export const DELETE = withOrgAuth(async (request: OrgAuthenticatedRequest, { params }: { params: Promise<{ tagId: string }> }) => {
  try {
    // Vérification des permissions (OWNER seulement pour la suppression)
    if (request.organization.role !== "OWNER") {
      return NextResponse.json(
        { error: "Seuls les propriétaires peuvent supprimer des tags" },
        { status: 403 }
      );
    }

    const { tagId } = await params;

    // Vérification que le tag existe et appartient à l'organisation
    const existingTag = await prisma.trainingTag.findFirst({
      where: {
        id: tagId,
        organizationId: request.organization.id,
      },
      include: {
        _count: {
          select: {
            memberTags: true,
            buildTags: true,
          },
        },
      },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: "Tag non trouvé" },
        { status: 404 }
      );
    }

    // Vérification des dépendances
    const hasDependencies = existingTag._count.memberTags > 0 || existingTag._count.buildTags > 0;
    if (hasDependencies) {
      return NextResponse.json(
        { 
          error: "Impossible de supprimer ce tag car il est utilisé",
          details: {
            memberTags: existingTag._count.memberTags,
            buildTags: existingTag._count.buildTags,
          },
        },
        { status: 409 }
      );
    }

    // Suppression du tag (cascade delete des relations)
    await prisma.trainingTag.delete({
      where: { id: tagId },
    });

    return NextResponse.json(
      { message: "Tag supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du tag:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression du tag" },
      { status: 500 }
    );
  }
});