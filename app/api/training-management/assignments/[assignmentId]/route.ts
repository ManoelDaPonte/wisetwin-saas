import { NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { updateTrainingAssignmentSchema } from "@/validators/training";

// GET /api/training-management/assignments/[assignmentId] - Récupérer un assignment spécifique
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest, { params }: { params: Promise<{ assignmentId: string }> }) => {
  try {
    const { assignmentId } = await params;

    const assignment = await prisma.trainingAssignment.findFirst({
      where: {
        id: assignmentId,
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

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment non trouvé" },
        { status: 404 }
      );
    }

    // Calculer les statistiques de progression
    const totalMembers = assignment.tag._count?.memberTags || 0;
    const completedCount = assignment._count.completions;
    const completionRate = totalMembers > 0 ? (completedCount / totalMembers) * 100 : 0;

    const assignmentWithStats = {
      ...assignment,
      stats: {
        totalMembers,
        completedCount,
        pendingCount: totalMembers - completedCount,
        completionRate: Math.round(completionRate * 100) / 100,
      },
    };

    return NextResponse.json(assignmentWithStats);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'assignment:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération" },
      { status: 500 }
    );
  }
});

// PUT /api/training-management/assignments/[assignmentId] - Mettre à jour un assignment
export const PUT = withOrgAuth(async (request: OrgAuthenticatedRequest, { params }: { params: Promise<{ assignmentId: string }> }) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour modifier cet assignment" },
        { status: 403 }
      );
    }

    const { assignmentId } = await params;
    const body = await request.json();
    const validatedData = updateTrainingAssignmentSchema.parse(body);

    // Vérifier que l'assignment existe et appartient à l'organisation
    const existingAssignment = await prisma.trainingAssignment.findFirst({
      where: {
        id: assignmentId,
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

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment non trouvé" },
        { status: 404 }
      );
    }

    const updatedAssignment = await prisma.trainingAssignment.update({
      where: { id: assignmentId },
      data: validatedData,
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

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'assignment:", error);
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

// DELETE /api/training-management/assignments/[assignmentId] - Supprimer un assignment
export const DELETE = withOrgAuth(async (request: OrgAuthenticatedRequest, { params }: { params: Promise<{ assignmentId: string }> }) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour supprimer cet assignment" },
        { status: 403 }
      );
    }

    const { assignmentId } = await params;

    // Vérifier que l'assignment existe et appartient à l'organisation
    const existingAssignment = await prisma.trainingAssignment.findFirst({
      where: {
        id: assignmentId,
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

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment non trouvé" },
        { status: 404 }
      );
    }

    // Suppression de l'assignment (les completions seront supprimées en cascade)
    await prisma.trainingAssignment.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json({
      message: "Assignment supprimé avec succès",
      tag: existingAssignment.tag,
      completionsDeleted: existingAssignment._count.completions,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'assignment:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression" },
      { status: 500 }
    );
  }
});