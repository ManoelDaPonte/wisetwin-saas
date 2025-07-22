import { BuildType } from "./azure";

export function getBuildUrls(containerId: string, buildType: BuildType, buildId: string) {
  // Construire l'URL de base Azure Blob Storage
  const storageAccountName = "wisetwindev";
  const baseUrl = `https://${storageAccountName}.blob.core.windows.net/${containerId}`;
  const basePath = `${buildType}/${buildId}`;

  return {
    loader: `${baseUrl}/${basePath}.loader.js`,
    framework: `${baseUrl}/${basePath}.framework.js.gz`,
    wasm: `${baseUrl}/${basePath}.wasm.gz`,
    data: `${baseUrl}/${basePath}.data.gz`,
  };
}