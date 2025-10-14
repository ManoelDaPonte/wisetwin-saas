import { NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { 
  CreateTrainingTagSchema, 
  GetTrainingTagsQuerySchema 
} from "@/validators/training";
import { TrainingTagsResponse } from "@/types/training";

// GET /api/training-management/tags - Récupérer les tags de formation d'une organisation
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validation des paramètres de requête
    const queryValidation = GetTrainingTagsQuerySchema.safeParse({
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
      includeArchived: searchParams.get("includeArchived") ?? undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Paramètres de requête invalides", details: queryValidation.error.errors },
        { status: 400 }
      );
    }

    const { search, limit = 50, offset = 0, includeArchived } = queryValidation.data;

    // Conditions de recherche
    const whereConditions = {
      organizationId: request.organization.id,
      ...(includeArchived ? {} : { archived: false }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    // Récupération des tags avec comptages
    const [tags, total] = await Promise.all([
      prisma.trainingTag.findMany({
        where: whereConditions,
        include: {
          _count: {
            select: {
              memberTags: true,
              buildTags: true,
            },
          },
        },
        orderBy: [
          { updatedAt: "desc" },
          { name: "asc" },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.trainingTag.count({
        where: whereConditions,
      }),
    ]);

    const response: TrainingTagsResponse = {
      tags: tags as TrainingTagsResponse['tags'], // Type mismatch between Prisma and interface
      total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération des tags:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des tags" },
      { status: 500 }
    );
  }
});

// POST /api/training-management/tags - Créer un nouveau tag de formation
export const POST = withOrgAuth(async (request: OrgAuthenticatedRequest) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour créer des tags" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validation des données
    const validation = CreateTrainingTagSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, color, description, dueDate, priority, archived } = validation.data;

    // Vérification de l'unicité du nom dans l'organisation
    const existingTag = await prisma.trainingTag.findFirst({
      where: {
        name,
        organizationId: request.organization.id,
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "Un tag avec ce nom existe déjà dans cette organisation" },
        { status: 409 }
      );
    }

    // Création du tag
    const newTag = await prisma.trainingTag.create({
      data: {
        name,
        color,
        description,
        dueDate,
        priority,
        archived: archived ?? false,
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

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du tag:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du tag" },
      { status: 500 }
    );
  }
});
