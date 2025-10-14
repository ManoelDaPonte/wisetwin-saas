// Validators Zod pour le système de gestion de formations
import { z } from "zod";

// === VALIDATORS DE BASE ===

export const BuildTypeSchema = z.enum(["WISETOUR", "WISETRAINER"]);

// Regex pour valider les codes couleur hexadécimaux
const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// === VALIDATORS POUR LES FORMULAIRES DE CRÉATION ===

const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

// Schema pour l'input du formulaire (dueDate en string)
export const CreateTrainingTagInputSchema = z.object({
  name: z.string()
    .min(1, "Le nom du tag est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-Z0-9\s\-_À-ÿ]+$/, "Le nom ne peut contenir que des lettres, chiffres, espaces et tirets"),
  color: z.string()
    .regex(colorRegex, "Format de couleur invalide (ex: #FF5733)")
    .default("#3B82F6"), // Couleur bleue par défaut
  description: z.string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional(),
  archived: z.boolean().default(false).optional(),
  dueDate: z.string().nullable().optional(),
  priority: PrioritySchema.default("MEDIUM").optional(),
});

// Schema pour l'API (dueDate transformé en Date)
export const CreateTrainingTagSchema = CreateTrainingTagInputSchema.extend({
  dueDate: z.string().nullable().optional().transform((val) => {
    if (!val || val === "") return null;
    const date = new Date(val);
    return isNaN(date.getTime()) ? null : date;
  }),
});

// Schema pour l'update du formulaire (dueDate en string)  
export const UpdateTrainingTagInputSchema = CreateTrainingTagInputSchema.partial();

export const UpdateTrainingTagSchema = CreateTrainingTagSchema.partial();

export const AssignTagToMemberSchema = z.object({
  userId: z.string().cuid("ID utilisateur invalide"),
  tagId: z.string().cuid("ID tag invalide"),
});

export const CreateBuildTagSchema = z.object({
  tagId: z.string().cuid("ID tag invalide"),
  buildName: z.string().min(1, "Le nom du build est requis"),
  buildType: BuildTypeSchema,
  containerId: z.string().min(1, "L'ID du container est requis"),
});

export const UpdateBuildTagSchema = z.object({
  // BuildTag est maintenant une simple association - pas de champs modifiables
});

// === VALIDATORS POUR LES REQUÊTES API ===

export const GetTrainingTagsQuerySchema = z.object({
  organizationId: z.string().cuid().optional(),
  search: z.string().max(100).optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
  includeArchived: z
    .union([z.boolean(), z.string().transform((val) => val === "true")])
    .optional(),
});

export const GetMemberTagsQuerySchema = z.object({
  organizationId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  tagId: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export const GetBuildTagsQuerySchema = z.object({
  organizationId: z.string().cuid().optional(),
  tagId: z.string().cuid().optional(),
  buildType: BuildTypeSchema.optional(),
  containerId: z.string().optional(),
  priority: PrioritySchema.optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

// === VALIDATORS POUR LES BULK OPERATIONS ===

export const BulkAssignTagsSchema = z.object({
  userIds: z.array(z.string().cuid()).min(1, "Au moins un utilisateur doit être sélectionné"),
  tagIds: z.array(z.string().cuid()).min(1, "Au moins un tag doit être sélectionné"),
});

export const BulkRemoveTagsSchema = z.object({
  userIds: z.array(z.string().cuid()).min(1, "Au moins un utilisateur doit être sélectionné"),
  tagIds: z.array(z.string().cuid()).min(1, "Au moins un tag doit être sélectionné"),
});

export const BulkAssignBuildTagsSchema = z.object({
  buildIds: z.array(z.string().min(1, "ID build requis")).min(1, "Au moins un build doit être sélectionné"),
  tagIds: z.array(z.string().cuid()).min(1, "Au moins un tag doit être sélectionné"),
});

export const BulkRemoveBuildTagsSchema = z.object({
  buildIds: z.array(z.string().min(1, "ID build requis")).min(1, "Au moins un build doit être sélectionné"),
  tagIds: z.array(z.string().cuid()).min(1, "Au moins un tag doit être sélectionné"),
});

// Alias pour la compatibilité avec l'importation en camelCase
export const createBuildTagSchema = CreateBuildTagSchema;
export const updateBuildTagSchema = UpdateBuildTagSchema;
export const bulkAssignBuildTagsSchema = BulkAssignBuildTagsSchema;
export const bulkRemoveBuildTagsSchema = BulkRemoveBuildTagsSchema;

// === TYPES INFÉRÉS ===

export type CreateTrainingTagInputData = z.infer<typeof CreateTrainingTagInputSchema>;
export type CreateTrainingTagInput = z.infer<typeof CreateTrainingTagSchema>;
export type UpdateTrainingTagInputData = z.infer<typeof UpdateTrainingTagInputSchema>;
export type UpdateTrainingTagInput = z.infer<typeof UpdateTrainingTagSchema>;
export type AssignTagToMemberInput = z.infer<typeof AssignTagToMemberSchema>;
export type GetTrainingTagsQuery = z.infer<typeof GetTrainingTagsQuerySchema>;
export type GetMemberTagsQuery = z.infer<typeof GetMemberTagsQuerySchema>;
export type GetBuildTagsQuery = z.infer<typeof GetBuildTagsQuerySchema>;
export type BulkAssignTagsInput = z.infer<typeof BulkAssignTagsSchema>;
export type BulkRemoveTagsInput = z.infer<typeof BulkRemoveTagsSchema>;
