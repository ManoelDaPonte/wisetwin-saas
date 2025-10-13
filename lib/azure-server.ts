// Ce fichier contient UNIQUEMENT les fonctions server-side avec Azure Storage Blob
// NE PAS IMPORTER dans les composants client !

import { 
  BlobServiceClient, 
  BlobSASPermissions
} from "@azure/storage-blob";
import { env } from "@/lib/env";
import { Build, BuildType, BuildFile, isAzureError } from "@/types/azure";
import { FormationMetadata } from "@/types/metadata-types";

// Utilitaire pour convertir un stream en Buffer
async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on('data', (chunk) => {
      chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}

const blobServiceClient = BlobServiceClient.fromConnectionString(
  env.AZURE_STORAGE_CONNECTION_STRING
);

function sanitizeContainerName(name: string): string {
  // Azure container names must be lowercase, 3-63 chars, and can only contain letters, numbers, and hyphens
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-") // Replace invalid chars with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .slice(0, 63); // Max length 63
}

export async function createUserContainer(userEmail: string, userId: string) {
  // Extract username from email and sanitize
  const username = userEmail.split("@")[0];
  // Use first 8 chars of userId for uniqueness
  const shortId = userId.substring(0, 8);
  const containerName = `personal-${sanitizeContainerName(
    username
  )}-${shortId}`;
  const containerClient = blobServiceClient.getContainerClient(containerName);

  try {
    await containerClient.create();
    return containerName;
  } catch (error) {
    if (isAzureError(error) && error.statusCode === 409) {
      // Container already exists
      return containerName;
    }
    throw error;
  }
}

export async function createOrganizationContainer(
  organizationName: string,
  organizationId: string
) {
  // Use first 8 chars of organizationId for uniqueness
  const shortId = organizationId.substring(0, 8);
  const containerName = `org-${sanitizeContainerName(
    organizationName
  )}-${shortId}`;
  const containerClient = blobServiceClient.getContainerClient(containerName);

  try {
    await containerClient.create();
    return containerName;
  } catch (error) {
    if (isAzureError(error) && error.statusCode === 409) {
      // Container already exists
      return containerName;
    }
    throw error;
  }
}

// Liste tous les builds d'un container (SERVER-SIDE ONLY)
export async function listBuilds(
  containerId: string,
  buildType: BuildType
): Promise<Build[]> {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerId);

    // Récupérer tous les blobs (incluant métadonnées maintenant)
    const allBlobs: Array<{name: string, properties: {contentLength?: number, lastModified?: Date}}> = [];
    for await (const blob of containerClient.listBlobsFlat({
      prefix: `${buildType}/`,
    })) {
      allBlobs.push(blob);
    }

    // Séparer les fichiers Unity et les métadonnées
    const buildBlobs: Array<{name: string, properties: {contentLength?: number, lastModified?: Date}}> = [];
    const metadataBlobs: { [buildName: string]: {name: string, properties: {contentLength?: number, lastModified?: Date}} } = {};

    for (const blob of allBlobs) {
      if (blob.name.includes("-metadata.json")) {
        // C'est un fichier de métadonnées
        const buildName = blob.name
          .replace(`${buildType}/`, "")
          .replace("-metadata.json", "");
        metadataBlobs[buildName] = blob;
      } else {
        // C'est un fichier Unity
        buildBlobs.push(blob);
      }
    }

    // Group Unity files by build name
    const buildGroups: { [buildName: string]: Array<{name: string, properties: {contentLength?: number, lastModified?: Date}}> } = {};
    
    for (const blob of buildBlobs) {
      // Extraire le nom du build (tout ce qui précède la première extension)
      const buildName = blob.name
        .replace(`${buildType}/`, "")
        .split(".")[0];

      if (!buildGroups[buildName]) {
        buildGroups[buildName] = [];
      }
      buildGroups[buildName].push(blob);
    }

    const builds: Build[] = [];

    for (const [buildName, buildBlobs] of Object.entries(buildGroups)) {
      if (buildBlobs.length === 0) continue;

      const build: Build = {
        id: buildName,
        name: buildName,
        buildType,
        files: {},
        totalSize: 0,
        lastModified: undefined,
      };

      let latestModified: Date | undefined;

      for (const blob of buildBlobs) {
        const blobClient = containerClient.getBlobClient(blob.name);
        const sasUrl = await blobClient.generateSasUrl({
          permissions: BlobSASPermissions.parse("r"),
          expiresOn: new Date(new Date().valueOf() + 15 * 60 * 1000),
        });

        const fileInfo: BuildFile = {
          name: blob.name,
          url: sasUrl,
          size: blob.properties.contentLength || 0,
          lastModified: blob.properties.lastModified,
        };

        build.totalSize += fileInfo.size;

        if (fileInfo.lastModified && (!latestModified || fileInfo.lastModified > latestModified)) {
          latestModified = fileInfo.lastModified;
        }

        // Organize files by type
        if (blob.name.includes("loader.js")) {
          build.files.loader = fileInfo;
        } else if (blob.name.includes("framework.js")) {
          build.files.framework = fileInfo;
        } else if (blob.name.includes("wasm")) {
          build.files.wasm = fileInfo;
        } else if (blob.name.includes("data")) {
          build.files.data = fileInfo;
        }
      }

      build.lastModified = latestModified?.toISOString();

      // Récupérer les métadonnées si elles existent
      if (metadataBlobs[buildName]) {
        try {
          const metadataBlob = containerClient.getBlobClient(metadataBlobs[buildName].name);
          const downloadResponse = await metadataBlob.download();
          const metadataContent = await streamToBuffer(downloadResponse.readableStreamBody!);
          const metadataJson: FormationMetadata = JSON.parse(metadataContent.toString());
          
          // Enrichir le build avec les métadonnées
          build.metadata = metadataJson;

          // Ne copier que les propriétés de type string (pas les objets multilingues)
          if (typeof metadataJson.description === 'string') {
            build.description = metadataJson.description || build.description;
          }
          build.category = metadataJson.category || build.category;
          build.version = metadataJson.version || build.version;
          build.imageUrl = metadataJson.imageUrl || build.imageUrl;
          build.difficulty = metadataJson.difficulty || build.difficulty;
          build.duration = metadataJson.duration || build.duration;
          build.tags = metadataJson.tags || build.tags;
          if (Array.isArray(metadataJson.objectives)) {
            build.objectives = metadataJson.objectives || build.objectives;
          }
          if (Array.isArray(metadataJson.prerequisites)) {
            build.prerequisites = metadataJson.prerequisites || build.prerequisites;
          }
        } catch (error) {
          console.warn(`Erreur lors de la lecture des métadonnées pour ${buildName}:`, error);
          build.metadata = null;
        }
      } else {
        build.metadata = null;
      }

      builds.push(build);
    }

    return builds;

  } catch (error) {
    console.error(`Error listing builds for ${containerId}:`, error);
    throw new Error(`Failed to list builds: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteContainer(containerId: string): Promise<void> {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerId);
    await containerClient.delete();
  } catch (error) {
    if (isAzureError(error) && error.statusCode === 404) {
      // Container doesn't exist, that's fine
      return;
    }
    throw error;
  }
}