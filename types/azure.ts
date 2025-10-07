// Types et interfaces partagées pour Azure et les builds

export type BuildType = "wisetour" | "wisetrainer";

// Interface pour les fichiers de build
export interface BuildFile {
  name: string;
  url: string;
  size: number;
  lastModified: Date | undefined;
}

export interface Build {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  version?: string;
  lastModified?: string;
  imageUrl?: string;
  difficulty?: string;
  duration?: string;
  tags?: string[];
  objectives?: string[];
  prerequisites?: string[];
  buildType: BuildType;
  // Fichiers Unity spécifiques
  files: {
    loader?: BuildFile;
    framework?: BuildFile;
    wasm?: BuildFile;
    data?: BuildFile;
  };
  totalSize: number;
  // Métadonnées enrichies (si fichier metadata présent)
  metadata?: {
    title?: string | { en: string; fr: string };
    description?: string | { en: string; fr: string };
    difficulty?: string;
    duration?: string;
    tags?: string[];
    objectives?: string[];
    [key: string]: unknown;
  } | null;
  // Informations de completion (ajoutées côté client)
  completion?: {
    completedAt: string;
    progress: number;
    startedAt: string;
  } | null;
}

export interface BuildUrls {
  [key: string]: string;
}

export interface AzureError {
  statusCode?: number;
}

export function isAzureError(error: unknown): error is AzureError {
  return error !== null && typeof error === "object" && "statusCode" in error;
}

// Interface pour formations terminées
export interface CompletedFormation {
  id: string;
  buildName: string;
  buildType: BuildType;
  containerId: string;
  progress: number;
  completedAt: string;
  startedAt: string;
  lastAccessedAt: string;
}