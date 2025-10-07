import { NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { UpdateTrainingTagSchema } from "@/validators/training";

// GET /api/training-management/tags/[tagId] - Récupérer un tag spécifique
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest, context?: unknown) => {
  try {
    const { tagId } = await (context as { params: Promise<{ tagId: string }> }).params;

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
            assignedBy: {
              select: {
                id: true,
                name: true,
                email: true,
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
export const PUT = withOrgAuth(async (request: OrgAuthenticatedRequest, context?: unknown) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour modifier des tags" },
        { status: 403 }
      );
    }

    const { tagId } = await (context as { params: Promise<{ tagId: string }> }).params;
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
export const DELETE = withOrgAuth(async (request: OrgAuthenticatedRequest, context?: unknown) => {
  try {
    // Vérification des permissions (OWNER ou ADMIN pour la suppression)
    if (request.organization.role !== "OWNER" && request.organization.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seuls les propriétaires et administrateurs peuvent supprimer des tags" },
        { status: 403 }
      );
    }

    const { tagId } = await (context as { params: Promise<{ tagId: string }> }).params;

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

    // Suppression en cascade
    // 1. Supprimer toutes les relations MemberTag
    if (existingTag._count.memberTags > 0) {
      await prisma.memberTag.deleteMany({
        where: { tagId },
      });
    }

    // 2. Supprimer toutes les relations BuildTag (et leurs completions via cascade Prisma)
    if (existingTag._count.buildTags > 0) {
      await prisma.buildTag.deleteMany({
        where: { tagId },
      });
    }

    // 3. Suppression du tag
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