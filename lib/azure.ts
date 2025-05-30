import { BlobServiceClient } from "@azure/storage-blob"
import { env } from "@/lib/config/env"

const blobServiceClient = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING)

function sanitizeContainerName(name: string): string {
  // Azure container names must be lowercase, 3-63 chars, and can only contain letters, numbers, and hyphens
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .slice(0, 63) // Max length 63
}

interface AzureError {
  statusCode?: number
}

function isAzureError(error: unknown): error is AzureError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'statusCode' in error
  )
}

export async function createUserContainer(userEmail: string, userId: string) {
  // Extract username from email and sanitize
  const username = userEmail.split('@')[0]
  // Use first 8 chars of userId for uniqueness
  const shortId = userId.substring(0, 8)
  const containerName = `personal-${sanitizeContainerName(username)}-${shortId}`
  const containerClient = blobServiceClient.getContainerClient(containerName)
  
  try {
    await containerClient.create()
    return containerName
  } catch (error) {
    if (isAzureError(error) && error.statusCode === 409) {
      // Container already exists
      return containerName
    }
    throw error
  }
}

export async function createOrganizationContainer(organizationName: string, organizationId: string) {
  // Use first 8 chars of organizationId for uniqueness
  const shortId = organizationId.substring(0, 8)
  const containerName = `org-${sanitizeContainerName(organizationName)}-${shortId}`
  const containerClient = blobServiceClient.getContainerClient(containerName)
  
  try {
    await containerClient.create()
    return containerName
  } catch (error) {
    if (isAzureError(error) && error.statusCode === 409) {
      // Container already exists
      return containerName
    }
    throw error
  }
}

export type BuildType = 'wisetour' | 'wisetrainer'

export interface BuildFile {
  name: string
  url: string
  size: number
  lastModified: Date | undefined
}

export interface Build {
  name: string
  buildType: BuildType
  files: {
    loader?: BuildFile
    framework?: BuildFile
    wasm?: BuildFile
    data?: BuildFile
  }
  totalSize: number
  lastModified: Date | undefined
}

export async function listBuilds(containerId: string, buildType: BuildType): Promise<Build[]> {
  const containerClient = blobServiceClient.getContainerClient(containerId)
  
  // Vérifier que le container existe
  const exists = await containerClient.exists()
  if (!exists) {
    throw new Error('Container not found')
  }
  
  // Lister les blobs dans le dossier spécifique
  const prefix = `${buildType}/`
  const buildFiles = new Map<string, Map<string, BuildFile>>()
  
  for await (const blob of containerClient.listBlobsFlat({ prefix })) {
    // Ignorer le dossier lui-même
    if (blob.name === prefix) continue
    
    // Extraire le nom du fichier sans le préfixe
    const nameWithoutPrefix = blob.name.replace(prefix, '')
    
    // Identifier le type de fichier Unity WebGL
    let fileType: 'loader' | 'framework' | 'wasm' | 'data' | null = null
    let buildName = ''
    
    if (nameWithoutPrefix.endsWith('.loader.js')) {
      fileType = 'loader'
      buildName = nameWithoutPrefix.replace('.loader.js', '')
    } else if (nameWithoutPrefix.endsWith('.framework.js.gz')) {
      fileType = 'framework'
      buildName = nameWithoutPrefix.replace('.framework.js.gz', '')
    } else if (nameWithoutPrefix.endsWith('.wasm.gz')) {
      fileType = 'wasm'
      buildName = nameWithoutPrefix.replace('.wasm.gz', '')
    } else if (nameWithoutPrefix.endsWith('.data.gz')) {
      fileType = 'data'
      buildName = nameWithoutPrefix.replace('.data.gz', '')
    }
    
    // Si c'est un fichier Unity WebGL reconnu
    if (fileType && buildName) {
      const blobClient = containerClient.getBlobClient(blob.name)
      
      // Créer l'entrée pour ce build si elle n'existe pas
      if (!buildFiles.has(buildName)) {
        buildFiles.set(buildName, new Map())
      }
      
      // Ajouter le fichier au build
      buildFiles.get(buildName)!.set(fileType, {
        name: nameWithoutPrefix,
        url: blobClient.url,
        size: blob.properties.contentLength || 0,
        lastModified: blob.properties.lastModified
      })
    }
  }
  
  // Convertir la map en array de builds
  const builds: Build[] = []
  for (const [buildName, files] of buildFiles) {
    // Calculer la taille totale et la date de modification la plus récente
    let totalSize = 0
    let lastModified: Date | undefined
    const buildFileObj: Build['files'] = {}
    
    for (const [fileType, file] of files) {
      totalSize += file.size
      if (!lastModified || (file.lastModified && file.lastModified > lastModified)) {
        lastModified = file.lastModified
      }
      buildFileObj[fileType as keyof Build['files']] = file
    }
    
    // Ajouter seulement si on a au moins un fichier
    if (Object.keys(buildFileObj).length > 0) {
      builds.push({
        name: buildName,
        buildType,
        files: buildFileObj,
        totalSize,
        lastModified
      })
    }
  }
  
  // Trier par date de modification (plus récent en premier)
  builds.sort((a, b) => {
    const dateA = new Date(a.lastModified || 0).getTime()
    const dateB = new Date(b.lastModified || 0).getTime()
    return dateB - dateA
  })
  
  return builds
}

export async function deleteContainer(containerName: string): Promise<void> {
  const containerClient = blobServiceClient.getContainerClient(containerName)
  
  try {
    // Vérifier si le container existe
    const exists = await containerClient.exists()
    if (exists) {
      // Supprimer le container et tout son contenu
      await containerClient.delete()
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression du container ${containerName}:`, error)
    // On ne lance pas l'erreur pour ne pas bloquer la suppression du compte
  }
}