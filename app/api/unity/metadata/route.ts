  import { NextRequest, NextResponse } from "next/server";
  import { getFormationMetadata } from "@/lib/admin/metadata-service";
  import { BuildType } from "@/types/azure";

  /**
   * API pour Unity - Récupération des métadonnées de formation
   * 
   * GET 
  /api/unity/metadata?buildName=formation-test&buildType=wisetrainer&containerId=xxx
   */
  export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const buildName = searchParams.get("buildName");
      const buildType = searchParams.get("buildType") as BuildType;
      const containerId = searchParams.get("containerId");
      const objectId = searchParams.get("objectId"); // Optionnel : filtrer par objet

      // Validation des paramètres requis
      if (!buildName) {
        return NextResponse.json({
          success: false,
          error: "Paramètre 'buildName' requis"
        }, { status: 400 });
      }

      if (!buildType || !["wisetrainer", "wisetour"].includes(buildType)) {
        return NextResponse.json({
          success: false,
          error: "Paramètre 'buildType' requis ('wisetrainer' ou 'wisetour')"
        }, { status: 400 });
      }

      if (!containerId) {
        return NextResponse.json({
          success: false,
          error: "Paramètre 'containerId' requis"
        }, { status: 400 });
      }

      // Récupérer les métadonnées depuis Azure
      const metadataResult = await getFormationMetadata({
        containerId,
        buildType,
        buildName
      });

      if (!metadataResult.exists) {
        return NextResponse.json({
          success: false,
          error: `Formation '${buildName}' introuvable dans le container 
  '${containerId}'`
        }, { status: 404 });
      }

      if (metadataResult.error) {
        return NextResponse.json({
          success: false,
          error: `Erreur lecture métadonnées: ${metadataResult.error}`
        }, { status: 500 });
      }

      const metadata = metadataResult.metadata;

      // Si objectId spécifié, filtrer pour cet objet uniquement
      let responseData = metadata;
      if (objectId && metadata?.unity) {
        // NOUVEAU FORMAT : accès direct à metadata.unity[objectId]
        const objectData = metadata.unity[objectId];
        if (objectData) {
          responseData = {
            ...metadata,
            unity: {
              [objectId]: objectData
            }
          };
        } else {
          return NextResponse.json({
            success: false,
            error: `Aucune donnée trouvée pour l'objet '${objectId}'`
          }, { status: 404 });
        }
      }

      // Logs pour debugging (à supprimer en production)
      console.log(`[Unity API] Formation '${buildName}' récupérée pour container 
  '${containerId}'`);
      if (objectId) {
        console.log(`[Unity API] Filtrage pour objet '${objectId}'`);
      }

      return NextResponse.json({
        success: true,
        data: responseData
      });

    } catch (error) {
      console.error("Erreur API Unity metadata:", error);
      return NextResponse.json({
        success: false,
        error: "Erreur serveur interne"
      }, { status: 500 });
    }
  }

  /**
   * OPTIONS - Pour gérer CORS depuis Unity
   */
  export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 heures
      },
    });
  }