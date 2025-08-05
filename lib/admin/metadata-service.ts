import { BlobServiceClient } from "@azure/storage-blob";
import { env } from "@/lib/env";
import { FormationMetadata, validateMetadata, getDefaultMetadata } from "./metadata";
import { BuildType } from "@/lib/azure";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  env.AZURE_STORAGE_CONNECTION_STRING
);

export interface MetadataService {
  containerId: string;
  buildType: BuildType;
  buildName: string;
}

/**
 * Lit les métadonnées d'une formation depuis Azure Blob Storage
 */
export async function getFormationMetadata({
  containerId,
  buildType,
  buildName,
}: MetadataService): Promise<{
  exists: boolean;
  metadata?: FormationMetadata;
  error?: string;
}> {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerId);
    const blobPath = `${buildType}/${buildName}-metadata.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    const exists = await blockBlobClient.exists();
    if (!exists) {
      return { exists: false };
    }

    const downloadResponse = await blockBlobClient.download();
    const content = await streamToString(downloadResponse.readableStreamBody!);
    
    try {
      const jsonData = JSON.parse(content);
      const validation = validateMetadata(jsonData);
      
      if (validation.success) {
        return { exists: true, metadata: validation.data };
      } else {
        return { 
          exists: true, 
          error: `Métadonnées invalides: ${Object.values(validation.errors).flat().join(', ')}` 
        };
      }
    } catch (parseError) {
      return { 
        exists: true, 
        error: "Fichier metadata.json corrompu" 
      };
    }
  } catch (error) {
    console.error("Erreur lecture métadonnées:", error);
    return { 
      exists: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

/**
 * Sauvegarde les métadonnées d'une formation dans Azure Blob Storage
 */
export async function saveFormationMetadata({
  containerId,
  buildType,
  buildName,
}: MetadataService, metadata: FormationMetadata): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Valider les métadonnées avant sauvegarde
    const validation = validateMetadata(metadata);
    if (!validation.success) {
      return { 
        success: false, 
        error: `Validation échouée: ${Object.values(validation.errors).flat().join(', ')}` 
      };
    }

    const containerClient = blobServiceClient.getContainerClient(containerId);
    const blobPath = `${buildType}/${buildName}-metadata.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    // Mettre à jour la date de modification
    const updatedMetadata = {
      ...validation.data,
      updatedAt: new Date().toISOString(),
    };

    const jsonContent = JSON.stringify(updatedMetadata, null, 2);
    
    await blockBlobClient.uploadData(Buffer.from(jsonContent), {
      blobHTTPHeaders: {
        blobContentType: "application/json",
      },
      metadata: {
        createdBy: "wisetwin-admin",
        lastModified: new Date().toISOString(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur sauvegarde métadonnées:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur de sauvegarde" 
    };
  }
}

/**
 * Crée un fichier metadata.json par défaut pour une formation
 */
export async function createDefaultMetadata({
  containerId,
  buildType,
  buildName,
}: MetadataService): Promise<{
  success: boolean;
  metadata?: FormationMetadata;
  error?: string;
}> {
  try {
    // Vérifier si le fichier existe déjà
    const existing = await getFormationMetadata({ containerId, buildType, buildName });
    if (existing.exists) {
      return { 
        success: false, 
        error: "Les métadonnées existent déjà" 
      };
    }

    // Créer les métadonnées par défaut
    const defaultMetadata = getDefaultMetadata(buildName);
    
    // Sauvegarder
    const saveResult = await saveFormationMetadata(
      { containerId, buildType, buildName }, 
      defaultMetadata
    );

    if (saveResult.success) {
      return { success: true, metadata: defaultMetadata };
    } else {
      return { success: false, error: saveResult.error };
    }
  } catch (error) {
    console.error("Erreur création métadonnées par défaut:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur de création" 
    };
  }
}

/**
 * Supprime le fichier metadata.json d'une formation
 */
export async function deleteFormationMetadata({
  containerId,
  buildType,
  buildName,
}: MetadataService): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerId);
    const blobPath = `${buildType}/${buildName}-metadata.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    const exists = await blockBlobClient.exists();
    if (!exists) {
      return { success: true }; // Already deleted
    }

    await blockBlobClient.delete();
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression métadonnées:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur de suppression" 
    };
  }
}

// Utilitaire pour convertir un stream en string
async function streamToString(readableStream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    readableStream.on("error", reject);
  });
}