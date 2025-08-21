// Types pour les métadonnées des formations Unity
import { BuildFile, BuildType } from "@/types/azure";
import { FormationMetadata, FormationModule } from "@/lib/admin/metadata";

// Re-export pour éviter de casser les imports existants
export type { FormationMetadata, FormationModule };

export interface UnityInteraction {
  title: string;
  description: string;
  order: number;
  safety_warning: string;
  safety_consequences: string;
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