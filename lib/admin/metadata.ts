import { z } from "zod";

// Schéma pour un module de formation
export const ModuleSchema = z.object({
  id: z.string().min(1, "L'ID du module est requis"),
  title: z.string().min(1, "Le titre du module est requis"),
  description: z.string().optional(),
  duration: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  order: z.number().optional(),
});

// Schéma principal pour les métadonnées de formation
export const FormationMetadataSchema = z.object({
  id: z.string().min(1, "L'ID de la formation est requis"),
  title: z.string().min(1, "Le titre de la formation est requis"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Format de version invalide (ex: 1.0.0)"),
  category: z.enum(["Débutant", "Intermédiaire", "Avancé", "Expert"], {
    errorMap: () => ({ message: "Catégorie invalide" }),
  }),
  duration: z.string().min(1, "La durée est requise"),
  difficulty: z.enum(["Très facile", "Facile", "Moyen", "Difficile", "Très difficile"], {
    errorMap: () => ({ message: "Difficulté invalide" }),
  }),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url("URL d'image invalide").optional().or(z.literal("")),
  
  // Modules de la formation
  modules: z.array(ModuleSchema).optional(),
  
  // Objectifs de la formation
  objectives: z.array(z.string()).optional(),
  
  // Prérequis
  prerequisites: z.array(z.string()).optional(),
  
  // Métadonnées de gestion
  createdAt: z.string().datetime("Date de création invalide"),
  updatedAt: z.string().datetime("Date de modification invalide"),
  
  // Métadonnées Unity (optionnelles)
  objectMapping: z.record(z.any()).optional(),
  unityVersion: z.string().optional(),
  
  // Métadonnées d'auteur
  author: z.object({
    name: z.string().optional(),
    email: z.string().email("Email invalide").optional(),
    organization: z.string().optional(),
  }).optional(),
});

export type FormationMetadata = z.infer<typeof FormationMetadataSchema>;
export type FormationModule = z.infer<typeof ModuleSchema>;

// Template par défaut
export const getDefaultMetadata = (formationName: string): FormationMetadata => ({
  id: formationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  title: formationName,
  description: "Description de la formation à compléter",
  version: "1.0.0",
  category: "Débutant",
  duration: "1 heure",
  difficulty: "Facile",
  tags: [],
  imageUrl: "",
  modules: [],
  objectives: [],
  prerequisites: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Validation avec gestion des erreurs
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
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { 
      success: false, 
      errors: { general: ["Erreur de validation inconnue"] } 
    };
  }
}