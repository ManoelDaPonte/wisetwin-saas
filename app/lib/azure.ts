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