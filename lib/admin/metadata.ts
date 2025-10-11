import { z } from "zod";

// Schéma pour un module de formation
export const ModuleSchema = z.object({
  id: z.string().min(1, "L'ID du module est requis"),
  title: z.string().min(1, "Le titre du module est requis"),
  description: z.string().optional(),
  duration: z.string().optional(),
  order: z.number().optional(),
});

// Schéma pour texte multilingue (string simple OU objet {en, fr})
const LocalizedStringSchema = z.union([
  z.string(),
  z.object({
    en: z.string(),
    fr: z.string(),
  })
]);

// Schéma principal pour les métadonnées de formation - VERSION PERMISSIVE
export const FormationMetadataSchema = z.object({
  id: z.string().min(1, "L'ID de la formation est requis"),
  title: LocalizedStringSchema,

  // Description avec valeur par défaut (toujours présente)
  description: LocalizedStringSchema.default("Description à compléter"),
  
  // Version avec valeur par défaut
  version: z.string().default("1.0.0"),
  
  // Catégories étendues pour inclure vos valeurs
  category: z.enum([
    "Débutant", "Intermédiaire", "Avancé", "Expert",
    "Introduction", "Général", "Spécialisé", // Ajout de vos catégories
  ], {
    errorMap: () => ({ message: "Catégorie invalide" }),
  }).default("Général"),
  
  // Durée avec valeur par défaut
  duration: z.string().default(""),
  
  // Difficultés étendues
  difficulty: z.enum([
    "Très facile", "Facile", "Moyen", "Difficile", "Très difficile"
  ], {
    errorMap: () => ({ message: "Difficulté invalide" }),
  }).default("Facile"),
  
  tags: z.array(z.string()).default([]),
  
  // URL d'image avec valeur par défaut
  imageUrl: z.string().default(""),
  
  // Modules de la formation
  modules: z.array(ModuleSchema).default([]),

  // Prérequis
  prerequisites: z.array(z.string()).default([]),
  
  // Métadonnées de gestion - plus permissives
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
  
  // Métadonnées Unity (optionnelles et très permissives)
  objectMapping: z.record(z.any()).optional(),
  unityVersion: z.string().optional(),
  unity: z.record(z.string(), z.any()).default({}), // Plus spécifique pour Unity
  
  // Métadonnées d'auteur
  author: z.object({
    name: z.string().optional(),
    email: z.string().optional(), // Email sans validation stricte
    organization: z.string().optional(),
  }).optional(),
}).passthrough(); // Permet les champs supplémentaires

export type FormationMetadata = z.infer<typeof FormationMetadataSchema>;
export type FormationModule = z.infer<typeof ModuleSchema>;

// Schéma encore plus permissif pour Unity (fallback)
export const FormationMetadataSchemaPermissive = z.object({
  id: z.string(),
  title: LocalizedStringSchema,
  description: LocalizedStringSchema.optional().default(""),
  version: z.string().optional().default("1.0.0"),
  category: z.string().optional().default("Général"), // Accepte n'importe quelle chaîne
  duration: z.string().optional().default(""),
  difficulty: z.string().optional().default("Facile"), // Accepte n'importe quelle chaîne
  tags: z.array(z.string()).optional().default([]),
  imageUrl: z.string().optional().default(""),
  modules: z.array(z.any()).optional().default([]), // Accepte n'importe quel module
  prerequisites: z.array(z.string()).optional().default([]),
  createdAt: z.string().optional().default(() => new Date().toISOString()),
  updatedAt: z.string().optional().default(() => new Date().toISOString()),
  unity: z.any().optional().default({}), // Accepte n'importe quoi pour Unity
}).passthrough();

// Template par défaut
export const getDefaultMetadata = (formationName: string): FormationMetadata => ({
  id: formationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  title: formationName,
  description: "Description à compléter",
  version: "1.0.0",
  category: "Débutant",
  duration: "1 heure",
  difficulty: "Facile",
  tags: [],
  imageUrl: "",
  modules: [],
  prerequisites: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  unity: {
    interactions: {},
    settings: {
      language: "fr",
      showHints: true,
      allowSkip: false,
      timeouts: {
        questionTimeout: 30000,
        interactionTimeout: 10000
      }
    }
  },
});

// Validation avec fallback automatique
export function validateMetadata(data: unknown): { 
  success: true; 
  data: FormationMetadata; 
} | { 
  success: false; 
  errors: Record<string, string[]>; 
} {
  try {
    const validData = FormationMetadataSchema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    
    // Fallback vers le schéma permissif
    try {
      const validData = FormationMetadataSchemaPermissive.parse(data);
      return { success: true, data: validData as FormationMetadata };
    } catch {
      
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) errors[path] = [];
          errors[path].push(err.message);
          console.error(`[Validation] Erreur ${path}: ${err.message}`);
        });
        return { success: false, errors };
      }
      
      return { 
        success: false, 
        errors: { general: ["Erreur de validation inconnue"] } 
      };
    }
  }
}

// Fonction pour transformer vos données existantes au bon format
export function normalizeMetadataForValidation(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  
  const normalized = { ...data } as Record<string, unknown>;
  
  // Corriger la catégorie si elle n'est pas dans les valeurs autorisées
  if (typeof normalized.category === 'string' && !["Débutant", "Intermédiaire", "Avancé", "Expert", "Introduction", "Général", "Spécialisé"].includes(normalized.category)) {
    console.log(`[Normalize] Catégorie '${normalized.category}' convertie en 'Général'`);
    normalized.category = "Général";
  }
  
  // Corriger la difficulté si nécessaire
  if (typeof normalized.difficulty === 'string' && !["Très facile", "Facile", "Moyen", "Difficile", "Très difficile"].includes(normalized.difficulty)) {
    console.log(`[Normalize] Difficulté '${normalized.difficulty}' convertie en 'Facile'`);
    normalized.difficulty = "Facile";
  }
  
  // S'assurer que la description a une valeur par défaut
  if (!normalized.description) {
    normalized.description = "Description à compléter";
  }
  
  // S'assurer que les dates sont au bon format
  if (typeof normalized.createdAt === 'string' && !isValidISODate(normalized.createdAt)) {
    normalized.createdAt = new Date().toISOString();
  }
  
  if (typeof normalized.updatedAt === 'string' && !isValidISODate(normalized.updatedAt)) {
    normalized.updatedAt = new Date().toISOString();
  }
  
  return normalized;
}

function isValidISODate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return date.toISOString() === dateString;
  } catch {
    return false;
  }
}