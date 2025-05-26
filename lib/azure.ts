import { BlobServiceClient } from "@azure/storage-blob"

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING

if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is not defined")
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)

export async function createUserContainer(userId: string) {
  const containerName = `user-${userId}`
  const containerClient = blobServiceClient.getContainerClient(containerName)
  
  try {
    await containerClient.create()
    return containerName
  } catch (error) {
    if ((error as any).statusCode === 409) {
      // Container already exists
      return containerName
    }
    throw error
  }
}

export async function createOrganizationContainer(organizationId: string) {
  const containerName = `org-${organizationId}`
  const containerClient = blobServiceClient.getContainerClient(containerName)
  
  try {
    await containerClient.create()
    return containerName
  } catch (error) {
    if ((error as any).statusCode === 409) {
      // Container already exists
      return containerName
    }
    throw error
  }
} 