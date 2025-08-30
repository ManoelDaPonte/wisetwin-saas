import { NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { 
  AssignTagToMemberSchema, 
  GetMemberTagsQuerySchema,
  BulkAssignTagsSchema,
  BulkRemoveTagsSchema
} from "@/validators/training";
import { MemberTagsResponse } from "@/types/training";

// GET /api/training-management/member-tags - Récupérer les assignments tag-membre
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validation des paramètres de requête
    const queryValidation = GetMemberTagsQuerySchema.safeParse({
      userId: searchParams.get("userId") || undefined,
      tagId: searchParams.get("tagId") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Paramètres de requête invalides", details: queryValidation.error.errors },
        { status: 400 }
      );
    }

    const { userId, tagId, limit = 50, offset = 0 } = queryValidation.data;

    // Conditions de recherche
    const whereConditions: any = {
      tag: {
        organizationId: request.organization.id,
      },
    };

    if (userId) {
      whereConditions.userId = userId;
    }

    if (tagId) {
      whereConditions.tagId = tagId;
    }

    // Récupération des member-tags avec détails
    const [memberTags, total] = await Promise.all([
      prisma.memberTag.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          tag: {
            select: {
              id: true,
              name: true,
              color: true,
              description: true,
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
        orderBy: [
          { createdAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.memberTag.count({
        where: whereConditions,
      }),
    ]);

    const response: MemberTagsResponse = {
      memberTags,
      total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération des member-tags:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des assignments" },
      { status: 500 }
    );
  }
});

// POST /api/training-management/member-tags - Assigner un tag à un membre
export const POST = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour assigner des tags" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Détection du type de requête (single ou bulk)
    if (Array.isArray(body.userIds) || Array.isArray(body.tagIds)) {
      // Bulk assignment
      const validation = BulkAssignTagsSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Données invalides", details: validation.error.errors },
          { status: 400 }
        );
      }

      return handleBulkAssignTags(request, validation.data);
    } else {
      // Single assignment
      const validation = AssignTagToMemberSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Données invalides", details: validation.error.errors },
          { status: 400 }
        );
      }

      return handleSingleAssignTag(request, validation.data);
    }
  } catch (error) {
    console.error("Erreur lors de l'assignment du tag:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'assignment" },
      { status: 500 }
    );
  }
});

// DELETE /api/training-management/member-tags - Retirer des tags (bulk uniquement)
export const DELETE = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour retirer des tags" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const validation = BulkRemoveTagsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { userIds, tagIds } = validation.data;

    // Vérifier que tous les tags appartiennent à l'organisation
    const tags = await prisma.trainingTag.findMany({
      where: {
        id: { in: tagIds },
        organizationId: request.organization.id,
      },
    });

    if (tags.length !== tagIds.length) {
      return NextResponse.json(
        { error: "Certains tags n'appartiennent pas à cette organisation" },
        { status: 400 }
      );
    }

    // Vérifier que tous les utilisateurs sont membres de l'organisation
    const members = await prisma.organizationMember.findMany({
      where: {
        userId: { in: userIds },
        organizationId: request.organization.id,
      },
    });

    const ownerUser = await prisma.organization.findUnique({
      where: { id: request.organization.id },
      select: { ownerId: true },
    });

    const validUserIds = [
      ...members.map(m => m.userId),
      ...(ownerUser && userIds.includes(ownerUser.ownerId) ? [ownerUser.ownerId] : [])
    ];

    if (validUserIds.length !== userIds.length) {
      return NextResponse.json(
        { error: "Certains utilisateurs ne sont pas membres de cette organisation" },
        { status: 400 }
      );
    }

    // Suppression des assignments
    const result = await prisma.memberTag.deleteMany({
      where: {
        userId: { in: userIds },
        tagId: { in: tagIds },
        tag: {
          organizationId: request.organization.id,
        },
      },
    });

    return NextResponse.json({
      message: "Tags retirés avec succès",
      removedCount: result.count,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression des tags:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression" },
      { status: 500 }
    );
  }
});

// === FONCTIONS UTILITAIRES ===

async function handleSingleAssignTag(
  request: OrgAuthenticatedRequest, 
  data: { userId: string; tagId: string }
) {
  const { userId, tagId } = data;

  // Vérifier que le tag appartient à l'organisation
  const tag = await prisma.trainingTag.findFirst({
    where: {
      id: tagId,
      organizationId: request.organization.id,
    },
  });

  if (!tag) {
    return NextResponse.json(
      { error: "Tag non trouvé dans cette organisation" },
      { status: 404 }
    );
  }

  // Vérifier que l'utilisateur est membre de l'organisation
  const member = await prisma.organizationMember.findFirst({
    where: {
      userId,
      organizationId: request.organization.id,
    },
  });

  const ownerUser = await prisma.organization.findUnique({
    where: { id: request.organization.id },
    select: { ownerId: true },
  });

  if (!member && ownerUser?.ownerId !== userId) {
    return NextResponse.json(
      { error: "Utilisateur non membre de cette organisation" },
      { status: 400 }
    );
  }

  // Créer l'assignment (avec upsert pour éviter les doublons)
  const memberTag = await prisma.memberTag.upsert({
    where: {
      userId_tagId: {
        userId,
        tagId,
      },
    },
    update: {
      assignedById: request.user.id,
    },
    create: {
      userId,
      tagId,
      assignedById: request.user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      tag: {
        select: {
          id: true,
          name: true,
          color: true,
          description: true,
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

  return NextResponse.json(memberTag, { status: 201 });
}

async function handleBulkAssignTags(
  request: OrgAuthenticatedRequest,
  data: { userIds: string[]; tagIds: string[] }
) {
  const { userIds, tagIds } = data;

  // Vérifier que tous les tags appartiennent à l'organisation
  const tags = await prisma.trainingTag.findMany({
    where: {
      id: { in: tagIds },
      organizationId: request.organization.id,
    },
  });

  if (tags.length !== tagIds.length) {
    return NextResponse.json(
      { error: "Certains tags n'appartiennent pas à cette organisation" },
      { status: 400 }
    );
  }

  // Vérifier que tous les utilisateurs sont membres de l'organisation
  const members = await prisma.organizationMember.findMany({
    where: {
      userId: { in: userIds },
      organizationId: request.organization.id,
    },
  });

  const ownerUser = await prisma.organization.findUnique({
    where: { id: request.organization.id },
    select: { ownerId: true },
  });

  const validUserIds = [
    ...members.map(m => m.userId),
    ...(ownerUser && userIds.includes(ownerUser.ownerId) ? [ownerUser.ownerId] : [])
  ];

  if (validUserIds.length !== userIds.length) {
    return NextResponse.json(
      { error: "Certains utilisateurs ne sont pas membres de cette organisation" },
      { status: 400 }
    );
  }

  // Créer toutes les combinaisons user-tag
  const memberTagsData = validUserIds.flatMap(userId =>
    tagIds.map(tagId => ({
      userId,
      tagId,
      assignedById: request.user.id,
    }))
  );

  // Créer les assignments en batch (avec skipDuplicates pour éviter les erreurs)
  const result = await prisma.memberTag.createMany({
    data: memberTagsData,
    skipDuplicates: true,
  });

  return NextResponse.json({
    message: "Tags assignés avec succès",
    createdCount: result.count,
    totalPossible: memberTagsData.length,
  }, { status: 201 });
}