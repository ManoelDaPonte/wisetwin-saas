// Fichier : app/api/builds/generate-sas-urls/route.ts

import { NextResponse } from "next/server";
import { 
  BlobServiceClient, 
  BlobSASPermissions 
} from "@azure/storage-blob";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";

// Initialisation simplifiée et recommandée via la chaîne de connexion
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const containerId = searchParams.get("containerId");
    const buildType = searchParams.get("buildType");
    const buildId = searchParams.get("buildId");

    // 1. Validation des paramètres d'entrée
    if (!containerId || !buildType || !buildId) {
      return NextResponse.json(
        { error: "Paramètres containerId, buildType, et buildId manquants" },
        { status: 400 }
      );
    }

    // SÉCURITÉ: Vérifier que l'utilisateur a accès à ce container
    if (containerId.startsWith("personal-")) {
      if (containerId !== req.user.azureContainerId) {
        return NextResponse.json(
          { error: "Accès refusé à ce container personnel" },
          { status: 403 }
        );
      }
    } else {
      const org = await prisma.organization.findFirst({
        where: { azureContainerId: containerId },
      });

      if (!org) {
        return NextResponse.json(
          { error: "Organisation introuvable" },
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
    const containerClient = blobServiceClient.getContainerClient(containerId);

    // 3. Génération des URLs SAS pour chaque fichier du build
    // On vise directement les fichiers compressés avec Brotli (.br)
  const fileNamesOnAzure = ["loader.js", "framework.js.br", "wasm.br", "data.br"];
  const sasUrls: { [key: string]: string } = {};
  for (const fileName of fileNamesOnAzure) {
    const blobName = `${buildType}/${buildId}.${fileName}`;
    const blobClient = containerClient.getBlobClient(blobName);

    const sasUrl = await blobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse("r"),
      expiresOn: new Date(new Date().valueOf() + 15 * 60 * 1000),
    });

    // La clé pour le JSON est le nom SANS l'extension de compression.
    // C'est ce que useUnityContext attend dans son objet de config.
    const cleanName = fileName.replace(".br", "");
    sasUrls[cleanName] = sasUrl;
  }


    console.log(sasUrls)

    // 4. Envoi des URLs sécurisées au client
    return NextResponse.json(sasUrls);

  } catch (error) {
    console.error("Erreur lors de la génération des URLs SAS:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue" },
      { status: 500 }
    );
  }
});