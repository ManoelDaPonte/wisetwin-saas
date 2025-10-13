import { z } from "zod";

// Enum pour les status de completion
export const CompletionStatusSchema = z.enum([
  "COMPLETED",
  "ABANDONED",
  "IN_PROGRESS",
  "FAILED",
]);

// Enum pour les types d'interactions
export const InteractionTypeSchema = z.enum([
  "question",
  "procedure",
  "text",
]);

// Enum pour les sous-types d'interactions
export const InteractionSubtypeSchema = z.enum([
  "multiple_choice",
  "single_choice",
  "sequential",
  "parallel",
  "informative",
  "tutorial",
]);

// Données spécifiques pour une interaction de type Question
export const QuestionAnalyticsDataSchema = z.object({
  questionText: z.string(),
  options: z.array(z.string()),
  correctAnswers: z.array(z.number()),
  userAnswers: z.array(z.array(z.number())), // Historique de toutes les tentatives
  firstAttemptCorrect: z.boolean(),
  finalScore: z.number(),
  selectionMode: z.enum(["single", "multiple"]).optional(),
  questionType: z.string().optional(),
});

// Données spécifiques pour une interaction de type Procédure
export const ProcedureAnalyticsDataSchema = z.object({
  stepNumber: z.number(),
  totalSteps: z.number(),
  instruction: z.string(),
  hintsUsed: z.number(),
  wrongClicks: z.number(),
});

// Données spécifiques pour une interaction de type Texte
export const TextAnalyticsDataSchema = z.object({
  textContent: z.string(),
  timeDisplayed: z.number(),
  readComplete: z.boolean(),
  scrollPercentage: z.number(),
});

// Enregistrement d'une interaction individuelle
export const InteractionRecordSchema = z.object({
  interactionId: z.string(),
  type: InteractionTypeSchema,
  subtype: InteractionSubtypeSchema,
  objectId: z.string(),
  startTime: z.string(), // ISO 8601
  endTime: z.string(), // ISO 8601
  duration: z.number(), // en secondes
  attempts: z.number(),
  success: z.boolean(),
  data: z.record(z.unknown()), // Données spécifiques au type
});

// Résumé statistique de la session
export const AnalyticsSummarySchema = z.object({
  totalInteractions: z.number(),
  successfulInteractions: z.number(),
  failedInteractions: z.number(),
  averageTimePerInteraction: z.number(),
  totalAttempts: z.number(),
  totalFailedAttempts: z.number(),
  successRate: z.number(), // Pourcentage
});

// Structure de données complète pour les analytics de formation
export const TrainingAnalyticsDataSchema = z.object({
  sessionId: z.string(),
  trainingId: z.string(),
  startTime: z.string(), // ISO 8601 format
  endTime: z.string(), // ISO 8601 format
  totalDuration: z.number(), // en secondes
  completionStatus: z.enum(["completed", "abandoned", "in_progress", "failed"]),
  interactions: z.array(InteractionRecordSchema),
  summary: AnalyticsSummarySchema,
});

// Input pour recevoir les analytics depuis Unity
export const CreateTrainingAnalyticsSchema = z.object({
  sessionId: z.string(),
  trainingId: z.string(),
  buildName: z.string(),
  buildType: z.enum(["wisetour", "wisetrainer", "WISETOUR", "WISETRAINER"]).transform(val => val.toUpperCase()),
  // Accepter "version" depuis Unity et le transformer en "buildVersion"
  version: z.string().optional(),
  buildVersion: z.string().optional(),
  containerId: z.string(),
  startTime: z.string(), // ISO 8601 format
  endTime: z.string(), // ISO 8601 format
  totalDuration: z.number(), // en secondes
  completionStatus: z.enum(["completed", "abandoned", "in_progress", "failed"]).transform(val => val.toUpperCase()),
  interactions: z.array(InteractionRecordSchema),
  summary: AnalyticsSummarySchema,
  authToken: z.string().optional(), // Token JWT pour l'authentification
}).transform((data) => {
  // Si "version" est fourni par Unity, l'utiliser comme buildVersion
  const buildVersion = data.version || data.buildVersion || "1.0.0";
  return { ...data, buildVersion };
});

// Query params pour récupérer les analytics
export const GetTrainingAnalyticsQuerySchema = z.object({
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  buildName: z.string().optional(),
  buildType: z.enum(["wisetour", "wisetrainer", "WISETOUR", "WISETRAINER"]).optional(),
  buildVersion: z.string().optional(), // Filtrer par version du build
  tagId: z.string().optional(),
  startDate: z.string().optional(), // ISO date
  endDate: z.string().optional(), // ISO date
  completionStatus: CompletionStatusSchema.optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
});

// Query params pour l'export
export const ExportAnalyticsQuerySchema = z.object({
  format: z.enum(["csv", "excel"]),
  organizationId: z.string().optional(),
  buildName: z.string().optional(),
  tagId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Analytics agrégées pour le dashboard
export const AggregatedAnalyticsSchema = z.object({
  totalSessions: z.number(),
  completedSessions: z.number(),
  abandonedSessions: z.number(),
  averageDuration: z.number(),
  averageSuccessRate: z.number(),
  totalUniqueUsers: z.number(),
  mostFailedQuestions: z.array(z.object({
    questionText: z.string(),
    failureRate: z.number(),
    attemptCount: z.number(),
  })),
  mostTimeConsumingInteractions: z.array(z.object({
    interactionId: z.string(),
    averageDuration: z.number(),
    type: InteractionTypeSchema,
  })),
});

// Types TypeScript dérivés des schemas
export type CompletionStatus = z.infer<typeof CompletionStatusSchema>;
export type InteractionType = z.infer<typeof InteractionTypeSchema>;
export type InteractionSubtype = z.infer<typeof InteractionSubtypeSchema>;
export type QuestionAnalyticsData = z.infer<typeof QuestionAnalyticsDataSchema>;
export type ProcedureAnalyticsData = z.infer<typeof ProcedureAnalyticsDataSchema>;
export type TextAnalyticsData = z.infer<typeof TextAnalyticsDataSchema>;
export type InteractionRecord = z.infer<typeof InteractionRecordSchema>;
export type AnalyticsSummary = z.infer<typeof AnalyticsSummarySchema>;
export type TrainingAnalyticsData = z.infer<typeof TrainingAnalyticsDataSchema>;
export type CreateTrainingAnalyticsInput = z.infer<typeof CreateTrainingAnalyticsSchema>;
export type GetTrainingAnalyticsQuery = z.infer<typeof GetTrainingAnalyticsQuerySchema>;
export type ExportAnalyticsQuery = z.infer<typeof ExportAnalyticsQuerySchema>;
export type AggregatedAnalytics = z.infer<typeof AggregatedAnalyticsSchema>;