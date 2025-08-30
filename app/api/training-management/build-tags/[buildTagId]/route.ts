import { NextRequest, NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { updateBuildTagSchema } from "@/validators/training";

// GET /api/training-management/build-tags/[buildTagId] - Récupérer un build-tag spécifique
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest, { params }: { params: Promise<{ buildTagId: string }> }) => {
  try {
    const { buildTagId } = await params;

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
        completions: {
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
          orderBy: {
            completedAt: "desc",
          },
        },
        _count: {
          select: {
            completions: true,
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

    // Calculer les statistiques de progression
    const totalMembers = buildTag.tag._count?.memberTags || 0;
    const completedCount = buildTag._count.completions;
    const completionRate = totalMembers > 0 ? (completedCount / totalMembers) * 100 : 0;

    const buildTagWithStats = {
      ...buildTag,
      stats: {
        totalMembers,
        completedCount,
        pendingCount: totalMembers - completedCount,
        completionRate: Math.round(completionRate * 100) / 100,
      },
    };

    return NextResponse.json(buildTagWithStats);
  } catch (error) {
    console.error("Erreur lors de la récupération du build-tag:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération" },
      { status: 500 }
    );
  }
});

// PUT /api/training-management/build-tags/[buildTagId] - Mettre à jour un build-tag
export const PUT = withOrgAuth(async (request: OrgAuthenticatedRequest, { params }: { params: Promise<{ buildTagId: string }> }) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour modifier ce build-tag" },
        { status: 403 }
      );
    }

    const { buildTagId } = await params;
    const body = await request.json();
    const validatedData = updateBuildTagSchema.parse(body);

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
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : validatedData.dueDate,
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
        _count: {
          select: {
            completions: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBuildTag);
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du build-tag:", error);
    if (error.name === "ZodError") {
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
export const DELETE = withOrgAuth(async (request: OrgAuthenticatedRequest, { params }: { params: Promise<{ buildTagId: string }> }) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour supprimer ce build-tag" },
        { status: 403 }
      );
    }

    const { buildTagId } = await params;

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
        _count: {
          select: {
            completions: true,
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

    // Suppression du build-tag (les completions seront supprimées en cascade)
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
      completionsDeleted: existingBuildTag._count.completions,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du build-tag:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression" },
      { status: 500 }
    );
  }
});