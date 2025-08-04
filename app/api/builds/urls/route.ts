import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";

async function streamToBuffer(readableStream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on("data", (data: any) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const containerId = searchParams.get("containerId");
    const buildType = searchParams.get("buildType") as "wisetour" | "wisetrainer";
    const buildId = searchParams.get("buildId");
    const fileType = searchParams.get("fileType"); // loader.js, framework.js, wasm, data

    if (!containerId || !buildType || !buildId || !fileType) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    if (!["wisetour", "wisetrainer"].includes(buildType)) {
      return NextResponse.json(
        { error: "buildType invalide" },
        { status: 400 }
      );
    }

    if (!["loader.js", "framework.js", "wasm", "data"].includes(fileType)) {
      return NextResponse.json(
        { error: "fileType invalide" },
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

    // Construire le chemin du blob
    const blobPath = `${buildType}/${buildId}.${fileType}`;

    // Connexion à Azure
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    );
    const containerClient = blobServiceClient.getContainerClient(containerId);

    // Gestion des fichiers .gz pour Unity
    let blobClient = containerClient.getBlobClient(blobPath);
    let exists = await blobClient.exists();

    // Si le fichier n'existe pas, essayer avec .gz
    if (!exists && (
      blobPath.endsWith(".data") ||
      blobPath.endsWith(".framework.js") ||
      blobPath.endsWith(".wasm")
    )) {
      const compressedPath = `${blobPath}.gz`;
      const compressedBlobClient = containerClient.getBlobClient(compressedPath);
      const compressedExists = await compressedBlobClient.exists();
      
      if (compressedExists) {
        blobClient = compressedBlobClient;
        exists = true;
      }
    }

    if (!exists) {
      return NextResponse.json(
        { error: `Fichier introuvable: ${blobPath}` },
        { status: 404 }
      );
    }

    // Télécharger le contenu
    const downloadResponse = await blobClient.download();
    const content = await streamToBuffer(downloadResponse.readableStreamBody);

    // Headers pour Unity WebGL
    const headers: Record<string, string> = {
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Content-Length": content.length.toString(),
    };

    // Type MIME selon le type de fichier
    if (fileType === "loader.js" || fileType === "framework.js") {
      headers["Content-Type"] = "application/javascript";
    } else if (fileType === "wasm") {
      headers["Content-Type"] = "application/wasm";
    } else if (fileType === "data") {
      headers["Content-Type"] = "application/octet-stream";
    }

    // Pour Unity WebGL, ne pas ajouter Content-Encoding même pour les fichiers .gz
    // Unity gère lui-même la décompression

    return new NextResponse(content, { headers });
  } catch (error) {
    console.error("Erreur lors de la génération des fichiers:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
});