import { NextResponse } from "next/server";
import { withSuperAdmin, SuperAdminRequest } from "@/lib/admin/auth";
import { 
  getFormationMetadata, 
  saveFormationMetadata, 
  createDefaultMetadata,
  deleteFormationMetadata 
} from "@/lib/admin/metadata-service";
import { BuildType } from "@/types/azure";

// GET - Récupérer les métadonnées d'une formation
export const GET = withSuperAdmin(async (req: SuperAdminRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const containerId = searchParams.get("containerId");
    const buildType = searchParams.get("buildType") as BuildType;
    const buildName = searchParams.get("buildName");

    if (!containerId || !buildType || !buildName) {
      return NextResponse.json(
        { error: "Paramètres manquants: containerId, buildType, buildName requis" },
        { status: 400 }
      );
    }

    if (buildType !== "wisetour" && buildType !== "wisetrainer") {
      return NextResponse.json(
        { error: "buildType invalide. Doit être 'wisetour' ou 'wisetrainer'" },
        { status: 400 }
      );
    }

    const result = await getFormationMetadata({
      containerId,
      buildType,
      buildName,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur récupération métadonnées:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des métadonnées" },
      { status: 500 }
    );
  }
});

// POST - Sauvegarder les métadonnées d'une formation
export const POST = withSuperAdmin(async (req: SuperAdminRequest) => {
  try {
    const body = await req.json();
    const { containerId, buildType, buildName, metadata } = body;

    if (!containerId || !buildType || !buildName || !metadata) {
      return NextResponse.json(
        { error: "Paramètres manquants: containerId, buildType, buildName, metadata requis" },
        { status: 400 }
      );
    }

    if (buildType !== "wisetour" && buildType !== "wisetrainer") {
      return NextResponse.json(
        { error: "buildType invalide. Doit être 'wisetour' ou 'wisetrainer'" },
        { status: 400 }
      );
    }

    const result = await saveFormationMetadata({
      containerId,
      buildType,
      buildName,
    }, metadata);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Métadonnées sauvegardées avec succès",
        updatedBy: req.user.email 
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur sauvegarde métadonnées:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la sauvegarde des métadonnées" },
      { status: 500 }
    );
  }
});

// PUT - Créer des métadonnées par défaut
export const PUT = withSuperAdmin(async (req: SuperAdminRequest) => {
  try {
    const body = await req.json();
    const { containerId, buildType, buildName } = body;

    if (!containerId || !buildType || !buildName) {
      return NextResponse.json(
        { error: "Paramètres manquants: containerId, buildType, buildName requis" },
        { status: 400 }
      );
    }

    if (buildType !== "wisetour" && buildType !== "wisetrainer") {
      return NextResponse.json(
        { error: "buildType invalide. Doit être 'wisetour' ou 'wisetrainer'" },
        { status: 400 }
      );
    }

    const result = await createDefaultMetadata({
      containerId,
      buildType,
      buildName,
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Métadonnées par défaut créées avec succès",
        metadata: result.metadata,
        createdBy: req.user.email 
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur création métadonnées par défaut:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création des métadonnées par défaut" },
      { status: 500 }
    );
  }
});

// DELETE - Supprimer les métadonnées d'une formation
export const DELETE = withSuperAdmin(async (req: SuperAdminRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const containerId = searchParams.get("containerId");
    const buildType = searchParams.get("buildType") as BuildType;
    const buildName = searchParams.get("buildName");

    if (!containerId || !buildType || !buildName) {
      return NextResponse.json(
        { error: "Paramètres manquants: containerId, buildType, buildName requis" },
        { status: 400 }
      );
    }

    if (buildType !== "wisetour" && buildType !== "wisetrainer") {
      return NextResponse.json(
        { error: "buildType invalide. Doit être 'wisetour' ou 'wisetrainer'" },
        { status: 400 }
      );
    }

    const result = await deleteFormationMetadata({
      containerId,
      buildType,
      buildName,
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Métadonnées supprimées avec succès",
        deletedBy: req.user.email 
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur suppression métadonnées:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression des métadonnées" },
      { status: 500 }
    );
  }
});