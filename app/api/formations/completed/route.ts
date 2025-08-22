import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import { listBuilds } from "@/lib/azure-server";
import { BuildType } from "@/types/azure";

// POST /api/formations/completed - Marquer une formation comme terminée (appelé depuis Unity)
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { buildName, buildType, containerId } = body;
    console.log(buildName, buildType, containerId)

    // Validation des paramètres requis
    if (!buildName || !buildType || !containerId) {
      return NextResponse.json(
        { error: "buildName, buildType et containerId sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que le buildType est valide
    const validBuildTypes = ["wisetour", "wisetrainer"];
    if (!validBuildTypes.includes(buildType.toLowerCase())) {
      return NextResponse.json(
        { error: "buildType doit être 'wisetour' ou 'wisetrainer'" },
        { status: 400 }
      );
    }

    // Vérifier l'accès au container (même logique que dans /api/builds/route.ts)
    if (containerId.startsWith("personal-")) {
      if (containerId !== req.user.azureContainerId) {
        return NextResponse.json(
          { error: "Accès refusé à ce container personnel" },
          { status: 403 }
        );
      }
    } else {
      // Container d'organisation
      const org = await prisma.organization.findFirst({
        where: { azureContainerId: containerId },
      });

      if (!org) {
        return NextResponse.json(
          { error: "Organisation non trouvée" },
          { status: 404 }
        );
      }

      const hasAccess = await prisma.organizationMember.findFirst({
        where: {
          organizationId: org.id,
          userId: req.user.id,
        },
      });

      if (!hasAccess && org.ownerId !== req.user.id) {
        return NextResponse.json(
          { error: "Accès refusé à cette organisation" },
          { status: 403 }
        );
      }
    }

    // Vérifier que la formation existe réellement dans Azure
    try {
      const azureBuilds = await listBuilds(containerId, buildType);
      const buildExists = azureBuilds.some((build: any) => 
        build.name === buildName || build.id === buildName
      );

      if (!buildExists) {
        return NextResponse.json(
          { 
            error: `Formation '${buildName}' introuvable dans le container ${containerId}`,
            details: "La formation doit exister dans Azure pour être marquée comme terminée"
          },
          { status: 404 }
        );
      }
    } catch (azureError) {
      console.error("Erreur lors de la vérification Azure:", azureError);
      return NextResponse.json(
        { 
          error: "Impossible de vérifier l'existence de la formation",
          details: "Erreur de communication avec Azure Storage"
        },
        { status: 503 }
      );
    }

    // Mettre à jour ou créer l'enregistrement UserBuild
    const userBuild = await prisma.userBuild.upsert({
      where: {
        userId_buildName_buildType_containerId: {
          userId: req.user.id,
          buildName,
          buildType: buildType.toUpperCase() as any,
          containerId,
        }
      },
      update: {
        completed: true,
        completedAt: new Date(),
        progress: 100, // Formation terminée
        lastAccessedAt: new Date(),
      },
      create: {
        userId: req.user.id,
        buildName,
        buildType: buildType.toUpperCase() as any,
        containerId,
        completed: true,
        completedAt: new Date(),
        progress: 100,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: "Formation marquée comme terminée",
      completion: {
        id: userBuild.id,
        buildName: userBuild.buildName,
        buildType: userBuild.buildType,
        completedAt: userBuild.completedAt,
        progress: userBuild.progress,
      }
    });

  } catch (error) {
    console.error("Erreur lors du marquage de la formation comme terminée:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 }
    );
  }
});

// GET /api/formations/completed - Récupérer les formations terminées de l'utilisateur
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const buildType = searchParams.get("buildType") as BuildType;
    const containerId = searchParams.get("containerId");

    // Construire les conditions de la requête
    const whereConditions: any = {
      userId: req.user.id,
      completed: true,
    };

    if (buildType) {
      if (!["wisetour", "wisetrainer"].includes(buildType.toLowerCase())) {
        return NextResponse.json(
          { error: "buildType doit être 'wisetour' ou 'wisetrainer'" },
          { status: 400 }
        );
      }
      whereConditions.buildType = buildType.toUpperCase();
    }

    if (containerId) {
      whereConditions.containerId = containerId;
    }

    // Récupérer les formations terminées
    const completedFormations = await prisma.userBuild.findMany({
      where: whereConditions,
      orderBy: {
        completedAt: "desc", // Plus récentes en premier
      }
    });

    // Formater les données pour l'interface
    const formattedCompletions = completedFormations.map(formation => ({
      id: formation.id,
      buildName: formation.buildName,
      buildType: formation.buildType,
      containerId: formation.containerId,
      progress: formation.progress,
      completedAt: formation.completedAt,
      startedAt: formation.startedAt,
      lastAccessedAt: formation.lastAccessedAt,
    }));

    return NextResponse.json({
      completions: formattedCompletions,
      total: formattedCompletions.length,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des formations terminées:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 }
    );
  }
});