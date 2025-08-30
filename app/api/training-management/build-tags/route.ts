import { NextRequest, NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { 
  createBuildTagSchema,
  bulkAssignBuildTagsSchema,
  bulkRemoveBuildTagsSchema,
  updateBuildTagSchema
} from "@/validators/training";

// GET /api/training-management/build-tags - Récupérer les assignments build-tag
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("tagId");
    const buildType = searchParams.get("buildType");
    const containerId = searchParams.get("containerId");
    const priority = searchParams.get("priority");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where = {
      tag: {
        organizationId: request.organization.id,
      },
      ...(tagId && { tagId }),
      ...(buildType && { buildType }),
      ...(containerId && { containerId }),
      ...(priority && { priority }),
    };

    const [buildTags, total] = await Promise.all([
      prisma.buildTag.findMany({
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
      prisma.buildTag.count({ where }),
    ]);

    return NextResponse.json({
      buildTags,
      pagination: {
        total,
        offset,
        limit,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des build-tags:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération" },
      { status: 500 }
    );
  }
});

// POST /api/training-management/build-tags - Assigner des tags aux builds
export const POST = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour assigner des tags aux builds" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Gestion du bulk assign ou single assign
    if (body.buildIds && body.tagIds) {
      // Bulk assign
      const validatedData = bulkAssignBuildTagsSchema.parse(body);
      const { buildIds, tagIds } = validatedData;

      // Vérifier que tous les tags appartiennent à l'organisation
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

      // Créer les assignments (combinaisons build-tag)
      const assignments: any[] = [];
      for (const buildId of buildIds) {
        // Déconstruire buildId en buildName, buildType, containerId
        // Format attendu: "buildName|buildType|containerId"
        const [buildName, buildType, containerId] = buildId.split("|");
        
        if (!buildName || !buildType || !containerId) {
          return NextResponse.json(
            { error: `Format buildId invalide: ${buildId}. Format attendu: "buildName|buildType|containerId"` },
            { status: 400 }
          );
        }

        for (const tagId of tagIds) {
          assignments.push({
            tagId,
            buildName,
            buildType: buildType as "WISETOUR" | "WISETRAINER",
            containerId,
            assignedById: request.user.id,
          });
        }
      }

      // Créer les assignments en évitant les doublons
      const createdAssignments = [];
      for (const assignment of assignments) {
        try {
          const created = await prisma.buildTag.create({
            data: assignment,
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
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
          createdAssignments.push(created);
        } catch (error: any) {
          // Ignorer les doublons (unique constraint violation)
          if (error.code !== 'P2002') {
            throw error;
          }
        }
      }

      return NextResponse.json({
        message: `${createdAssignments.length} assignments créés avec succès`,
        buildTags: createdAssignments,
        createdCount: createdAssignments.length,
      }, { status: 201 });
    } else {
      // Single assign
      const validatedData = createBuildTagSchema.parse(body);

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

      const buildTag = await prisma.buildTag.create({
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

      return NextResponse.json(buildTag, { status: 201 });
    }
  } catch (error: any) {
    console.error("Erreur lors de la création des build-tags:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.message },
        { status: 400 }
      );
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Cette combinaison build-tag existe déjà" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erreur serveur lors de la création" },
      { status: 500 }
    );
  }
});

// DELETE /api/training-management/build-tags - Suppression bulk des build-tags
export const DELETE = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour supprimer des build-tags" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = bulkRemoveBuildTagsSchema.parse(body);
    const { buildIds, tagIds } = validatedData;

    // Construire les conditions de suppression
    const deleteConditions = [];
    for (const buildId of buildIds) {
      const [buildName, buildType, containerId] = buildId.split("|");
      
      if (!buildName || !buildType || !containerId) {
        return NextResponse.json(
          { error: `Format buildId invalide: ${buildId}` },
          { status: 400 }
        );
      }

      for (const tagId of tagIds) {
        deleteConditions.push({
          tagId,
          buildName,
          buildType,
          containerId,
          tag: {
            organizationId: request.organization.id,
          },
        });
      }
    }

    // Supprimer tous les build-tags correspondants
    let deletedCount = 0;
    for (const condition of deleteConditions) {
      const result = await prisma.buildTag.deleteMany({
        where: condition,
      });
      deletedCount += result.count;
    }

    return NextResponse.json({
      message: `${deletedCount} assignments supprimés`,
      deletedCount,
    });
  } catch (error: any) {
    console.error("Erreur lors de la suppression des build-tags:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression" },
      { status: 500 }
    );
  }
});