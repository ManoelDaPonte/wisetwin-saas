import { NextRequest, NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { 
  createTrainingAssignmentSchema,
  bulkCreateAssignmentsSchema,
  updateTrainingAssignmentSchema
} from "@/validators/training";

// GET /api/training-management/assignments - Récupérer les assignments de formations
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("tagId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where = {
      tag: {
        organizationId: request.organization.id,
      },
      ...(tagId && { tagId }),
      ...(status && { status }),
    };

    const [assignments, total] = await Promise.all([
      prisma.trainingAssignment.findMany({
        where,
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
          _count: {
            select: {
              completions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.trainingAssignment.count({ where }),
    ]);

    return NextResponse.json({
      assignments,
      pagination: {
        total,
        offset,
        limit,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des assignments:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération" },
      { status: 500 }
    );
  }
});

// POST /api/training-management/assignments - Créer un assignment de formation
export const POST = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour créer des assignments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Gestion du bulk create ou single create
    if (Array.isArray(body) || body.assignments) {
      // Bulk create
      const validatedData = bulkCreateAssignmentsSchema.parse(body);
      const assignments = Array.isArray(validatedData) 
        ? validatedData 
        : validatedData.assignments;

      // Vérifier que tous les tags appartiennent à l'organisation
      const tagIds = assignments.map(a => a.tagId);
      const validTags = await prisma.trainingTag.findMany({
        where: {
          id: { in: tagIds },
          organizationId: request.organization.id,
        },
        select: { id: true },
      });

      const validTagIds = validTags.map(t => t.id);
      const invalidTagIds = tagIds.filter(id => !validTagIds.includes(id));

      if (invalidTagIds.length > 0) {
        return NextResponse.json(
          { error: `Tags non trouvés ou non autorisés: ${invalidTagIds.join(", ")}` },
          { status: 400 }
        );
      }

      // Créer les assignments
      const createdAssignments = await prisma.$transaction(
        assignments.map(assignment => 
          prisma.trainingAssignment.create({
            data: {
              ...assignment,
              assignedById: request.user.id,
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
          })
        )
      );

      return NextResponse.json({
        message: `${createdAssignments.length} assignments créés avec succès`,
        assignments: createdAssignments,
        createdCount: createdAssignments.length,
      }, { status: 201 });
    } else {
      // Single create
      const validatedData = createTrainingAssignmentSchema.parse(body);

      // Vérifier que le tag appartient à l'organisation
      const tag = await prisma.trainingTag.findFirst({
        where: {
          id: validatedData.tagId,
          organizationId: request.organization.id,
        },
      });

      if (!tag) {
        return NextResponse.json(
          { error: "Tag non trouvé ou non autorisé" },
          { status: 404 }
        );
      }

      const assignment = await prisma.trainingAssignment.create({
        data: {
          ...validatedData,
          assignedById: request.user.id,
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

      return NextResponse.json(assignment, { status: 201 });
    }
  } catch (error) {
    console.error("Erreur lors de la création des assignments:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur serveur lors de la création" },
      { status: 500 }
    );
  }
});

// PUT /api/training-management/assignments - Mise à jour bulk des assignments
export const PUT = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour modifier des assignments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { assignmentIds, updates } = body;

    if (!Array.isArray(assignmentIds) || assignmentIds.length === 0) {
      return NextResponse.json(
        { error: "IDs des assignments requis" },
        { status: 400 }
      );
    }

    const validatedUpdates = updateTrainingAssignmentSchema.parse(updates);

    // Vérifier que tous les assignments appartiennent à l'organisation
    const existingAssignments = await prisma.trainingAssignment.findMany({
      where: {
        id: { in: assignmentIds },
        tag: {
          organizationId: request.organization.id,
        },
      },
      select: { id: true },
    });

    const validAssignmentIds = existingAssignments.map(a => a.id);
    const invalidIds = assignmentIds.filter(id => !validAssignmentIds.includes(id));

    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Assignments non trouvés: ${invalidIds.join(", ")}` },
        { status: 400 }
      );
    }

    // Mise à jour en lot
    const updatedAssignments = await prisma.trainingAssignment.updateMany({
      where: {
        id: { in: validAssignmentIds },
      },
      data: validatedUpdates,
    });

    return NextResponse.json({
      message: `${updatedAssignments.count} assignments mis à jour`,
      updatedCount: updatedAssignments.count,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des assignments:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour" },
      { status: 500 }
    );
  }
});

// DELETE /api/training-management/assignments - Suppression bulk des assignments
export const DELETE = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour supprimer des assignments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { assignmentIds } = body;

    if (!Array.isArray(assignmentIds) || assignmentIds.length === 0) {
      return NextResponse.json(
        { error: "IDs des assignments requis" },
        { status: 400 }
      );
    }

    // Vérifier que tous les assignments appartiennent à l'organisation
    const existingAssignments = await prisma.trainingAssignment.findMany({
      where: {
        id: { in: assignmentIds },
        tag: {
          organizationId: request.organization.id,
        },
      },
      select: { id: true },
    });

    const validAssignmentIds = existingAssignments.map(a => a.id);
    const invalidIds = assignmentIds.filter(id => !validAssignmentIds.includes(id));

    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Assignments non trouvés: ${invalidIds.join(", ")}` },
        { status: 400 }
      );
    }

    // Suppression des assignments (les completions seront supprimées en cascade)
    const deletedAssignments = await prisma.trainingAssignment.deleteMany({
      where: {
        id: { in: validAssignmentIds },
      },
    });

    return NextResponse.json({
      message: `${deletedAssignments.count} assignments supprimés`,
      deletedCount: deletedAssignments.count,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression des assignments:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression" },
      { status: 500 }
    );
  }
});