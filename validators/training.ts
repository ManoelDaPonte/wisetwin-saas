// Validators Zod pour le système de gestion de formations
import { z } from "zod";

// === VALIDATORS DE BASE ===

export const TrainingStatusSchema = z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "OVERDUE"]);

export const BuildTypeSchema = z.enum(["WISETOUR", "WISETRAINER"]);

// Regex pour valider les codes couleur hexadécimaux
const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// === VALIDATORS POUR LES MODÈLES ===

const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const TrainingTagSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, "Le nom du tag est requis").max(50, "Le nom ne peut pas dépasser 50 caractères"),
  color: z.string().regex(colorRegex, "Format de couleur invalide (ex: #FF5733)").optional(),
  description: z.string().max(500, "La description ne peut pas dépasser 500 caractères").optional(),
  organizationId: z.string().cuid(),
  dueDate: z.date().optional().nullable(),
  priority: PrioritySchema.default("MEDIUM"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MemberTagSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  tagId: z.string().cuid(),
  assignedById: z.string().cuid(),
  createdAt: z.date(),
});

export const BuildTagSchema = z.object({
  id: z.string().cuid(),
  tagId: z.string().cuid(),
  buildName: z.string().min(1, "Le nom de la formation est requis"),
  buildType: BuildTypeSchema,
  containerId: z.string().min(1, "L'ID du container est requis"),
  assignedById: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TrainingCompletionSchema = z.object({
  id: z.string().cuid(),
  buildTagId: z.string().cuid(),
  userId: z.string().cuid(),
  status: TrainingStatusSchema.default("NOT_STARTED"),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  lastReminderSent: z.date().optional(),
  reminderCount: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// === VALIDATORS POUR LES FORMULAIRES DE CRÉATION ===

export const CreateTrainingTagSchema = z.object({
  name: z.string()
    .min(1, "Le nom du tag est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-Z0-9\s\-_À-ÿ]+$/, "Le nom ne peut contenir que des lettres, chiffres, espaces et tirets"),
  color: z.string()
    .regex(colorRegex, "Format de couleur invalide (ex: #FF5733)")
    .optional()
    .default("#3B82F6"), // Couleur bleue par défaut
  description: z.string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional(),
  dueDate: z.string().nullable().optional(),
  priority: PrioritySchema.default("MEDIUM").optional(),
});

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

// === VALIDATORS POUR LES ASSIGNMENTS DE FORMATIONS ===

export const CreateTrainingAssignmentSchema = z.object({
  userId: z.string().cuid("ID utilisateur invalide"),
  tagId: z.string().cuid("ID tag invalide"),
  buildName: z.string().min(1, "Le nom de la formation est requis"),
  buildType: BuildTypeSchema,
  containerId: z.string().min(1, "L'ID du container est requis"),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  isRequired: z.boolean().default(true),
  priority: PrioritySchema.default("MEDIUM"),
});

export const BulkCreateAssignmentsSchema = z.object({
  assignments: z.array(CreateTrainingAssignmentSchema).min(1, "Au moins un assignment doit être fourni"),
});

export const UpdateTrainingAssignmentSchema = z.object({
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : null),
  isRequired: z.boolean().optional(),
  priority: PrioritySchema.optional(),
  status: TrainingStatusSchema.optional(),
});

// === VALIDATORS POUR LES REQUÊTES API ===

export const GetTrainingTagsQuerySchema = z.object({
  organizationId: z.string().cuid().optional(),
  search: z.string().max(100).optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
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

export const GetTrainingProgressQuerySchema = z.object({
  organizationId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  assignmentId: z.string().cuid().optional(),
  status: TrainingStatusSchema.optional(),
  buildType: BuildTypeSchema.optional(),
  dateRange: z.object({
    start: z.string().datetime().or(z.date()),
    end: z.string().datetime().or(z.date()),
  }).optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

// === VALIDATORS POUR L'EXPORT ===

// ExportTrainingDataSchema supprimé car non utilisé

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

// Alias pour les assignments
export const createTrainingAssignmentSchema = CreateTrainingAssignmentSchema;
export const bulkCreateAssignmentsSchema = BulkCreateAssignmentsSchema;
export const updateTrainingAssignmentSchema = UpdateTrainingAssignmentSchema;

// === VALIDATORS POUR LES NOTIFICATIONS ===

// SendTrainingReminderSchema supprimé car non utilisé
// UpdateNotificationSettingsSchema supprimé car non utilisé

// === TYPES INFÉRÉS ===

export type CreateTrainingTagInput = z.infer<typeof CreateTrainingTagSchema>;
export type UpdateTrainingTagInput = z.infer<typeof UpdateTrainingTagSchema>;
export type AssignTagToMemberInput = z.infer<typeof AssignTagToMemberSchema>;
export type GetTrainingTagsQuery = z.infer<typeof GetTrainingTagsQuerySchema>;
export type GetMemberTagsQuery = z.infer<typeof GetMemberTagsQuerySchema>;
export type GetBuildTagsQuery = z.infer<typeof GetBuildTagsQuerySchema>;
export type GetTrainingProgressQuery = z.infer<typeof GetTrainingProgressQuerySchema>;
// ExportTrainingDataInput supprimé car non utilisé
export type BulkAssignTagsInput = z.infer<typeof BulkAssignTagsSchema>;
export type BulkRemoveTagsInput = z.infer<typeof BulkRemoveTagsSchema>;
// SendTrainingReminderInput et UpdateNotificationSettingsInput supprimés car non utilisés

// Types inférés pour les assignments
export type CreateTrainingAssignmentInput = z.infer<typeof CreateTrainingAssignmentSchema>;
export type BulkCreateAssignmentsInput = z.infer<typeof BulkCreateAssignmentsSchema>;
export type UpdateTrainingAssignmentInput = z.infer<typeof UpdateTrainingAssignmentSchema>;