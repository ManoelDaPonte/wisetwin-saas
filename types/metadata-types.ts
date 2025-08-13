// Types pour les métadonnées des formations Unity
import { BuildFile, BuildType } from "@/types/azure-types";

export interface UnityInteraction {
  title: string;
  description: string;
  order: number;
  safety_warning: string;
  safety_consequences: string;
}

export interface FormationModule {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  order?: number;
}

export interface FormationMetadata extends Record<string, unknown> {
  id: string;
  title: string;
  description: string;
  version: string;
  category: string;
  duration: string;
  difficulty: string;
  tags: string[];
  imageUrl: string;
  modules: FormationModule[];
  objectives: string[];
  prerequisites: string[];
  createdAt: string;
  updatedAt: string;
  unity: Record<string, UnityInteraction>;
}

// Type pour un build enrichi avec ses métadonnées
export interface BuildWithMetadata {
  // Propriétés du build de base
  id?: string;
  name: string;
  buildType: BuildType;
  files: {
    loader?: BuildFile;
    framework?: BuildFile;
    wasm?: BuildFile;
    data?: BuildFile;
  };
  totalSize: number;
  lastModified?: string;
  
  // Métadonnées enrichies (null si fichier metadata absent)
  metadata?: FormationMetadata | null;
  
  // Informations de completion (ajoutées côté client)
  completion?: {
    completedAt: string;
    progress: number;
    startedAt: string;
  } | null;
}