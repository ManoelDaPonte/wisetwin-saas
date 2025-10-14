// Types pour le système de gestion de formations
import type { FormationMetadata } from "@/types/metadata-types";

export interface TrainingTag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  organizationId: string;

  // Configuration du plan de formation
  dueDate?: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH";

  createdAt: Date;
  updatedAt: Date;

  // Relations optionnelles (pour les requêtes avec includes)
  memberTags?: MemberTag[];
  buildTags?: BuildTag[];
  _count?: {
    memberTags: number;
    buildTags: number;
  };
}

export interface MemberTag {
  id: string;
  userId: string;
  tagId: string;
  assignedById: string;
  createdAt: Date;

  // Relations optionnelles
  user?: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  tag?: TrainingTag;
  assignedBy?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface BuildTag {
  id: string;
  tagId: string;
  buildName: string;
  buildType: "WISETOUR" | "WISETRAINER";
  containerId: string;
  assignedById: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations optionnelles
  tag?: TrainingTag;
  assignedBy?: {
    id: string;
    name: string | null;
    email: string;
  };
}

// === TYPES POUR LES FORMULAIRES ===

export interface CreateTrainingTagData {
  name: string;
  color?: string;
  description?: string;
  dueDate?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH";
}

export interface UpdateTrainingTagData {
  name?: string;
  color?: string;
  description?: string;
  dueDate?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH";
}

export interface AssignTagToMemberData {
  userId: string;
  tagId: string;
}

export interface CreateBuildTagData {
  tagId: string;
  buildName: string;
  buildType: "WISETOUR" | "WISETRAINER";
  containerId: string;
}

// UpdateBuildTagData supprimé car non utilisé

export interface BulkAssignBuildTagsData {
  buildIds: string[];
  tagIds: string[];
}

export interface BulkRemoveBuildTagsData {
  buildIds: string[];
  tagIds: string[];
}

// Interface pour les builds avec leurs tags assignés
export interface BuildWithTags {
  // Hérite de toutes les propriétés d'un build Unity (metadata, imageUrl, etc.)
  id?: string;
  name: string;
  description?: string;
  category?: string;
  version?: string;
  lastModified?: string;
  imageUrl?: string;
  difficulty?: string;
  duration?: string;
  objectives?: string[];
  prerequisites?: string[];
  buildType: "wisetour" | "wisetrainer";
  files: {
    loader?: any;
    framework?: any;
    wasm?: any;
    data?: any;
  };
  totalSize: number;
  metadata?: {
    title?: string | { en: string; fr: string };
    description?: string | { en: string; fr: string };
    category?: string;
    version?: string;
    difficulty?: string;
    duration?: string;
    tags?: string[];
    objectives?: string[];
    imageUrl?: string;
    [key: string]: unknown;
  } | null;
  completion?: {
    completedAt: string;
    progress: number;
    startedAt: string;
  } | null;

  // Propriétés supplémentaires pour le système de formation
  type: "WISETOUR" | "WISETRAINER";
  containerId: string;
  updatedAt?: Date;
  size?: number;

  // Tags assignés à ce build
  tags: TrainingTag[];

  // Statistiques de progression
  stats: {
    totalMembers: number;
    completedCount: number;
    pendingCount: number;
    completionRate: number;
  };
}

// === TYPES POUR LES RÉPONSES API ===

export interface TrainingTagsResponse {
  tags: TrainingTag[];
  total: number;
}

export interface MemberTagsResponse {
  memberTags: MemberTag[];
  total: number;
}

export interface BuildTagsResponse {
  buildTags: BuildTag[];
  total: number;
}

export interface BuildsWithTagsResponse {
  builds: BuildWithTags[];
  total: number;
}

// === TYPES POUR LES VUES DASHBOARD ===

export interface MemberWithTrainings {
  id: string;
  firstName?: string | null;
  name: string | null;
  email: string;
  image?: string | null;
  tags: TrainingTag[];
}

// === TYPES POUR L'EXPORT ===

// ExportTrainingData supprimé car non utilisé
// ExportOptions supprimé car non utilisé

// === TYPES POUR LES ANALYTICS ===

export type CompletionStatus =
  | "COMPLETED"
  | "IN_PROGRESS"
  | "ABANDONED"
  | "FAILED";

// Types détaillés pour les données d'interaction - NOUVEAU FORMAT AVEC CLÉS

export interface QuestionInteractionData {
  questionKey: string;           // Clé de la question (ex: "question_1")
  objectId: string;              // ID de l'objet Unity (ex: "red_cube")
  correctAnswers: number[];
  userAnswers: number[][];       // Historique des tentatives
  firstAttemptCorrect: boolean;
  finalScore: number;            // 100 ou 0
}

export interface ProcedureStepAnalyticsData {
  stepNumber: number;            // 1, 2, 3...
  stepKey: string;               // Clé de l'étape (ex: "step_1")
  targetObjectId: string;        // ID de l'objet cible
  completed: boolean;
  duration: number;              // Durée de l'étape en secondes
  wrongClicksOnThisStep: number; // Erreurs sur cette étape uniquement
}

export interface ProcedureInteractionData {
  procedureKey: string;          // Clé de la procédure (ex: "procedure_startup")
  objectId: string;              // ID de l'objet Unity (ex: "yellow_capsule")
  totalSteps: number;
  steps: ProcedureStepAnalyticsData[];
  totalWrongClicks: number;      // Erreurs totales sur toute la procédure
  totalDuration: number;         // Durée totale de la procédure
  perfectCompletion: boolean;    // true si aucune erreur
  finalScore: number;            // 100 si parfait, 0 sinon
}

export interface TextInteractionData {
  contentKey: string;            // Clé du contenu (ex: "text_content")
  objectId: string;              // ID de l'objet Unity (ex: "green_cylinder")
  timeDisplayed: number;
  readComplete: boolean;
  scrollPercentage: number;
  finalScore: number;            // Toujours 100 pour les textes
}

export interface InteractionData {
  interactionId: string;
  type: "question" | "procedure" | "text" | string;
  subtype?: "single_choice" | "multiple_choice" | "sequential" | "parallel" | string;
  startTime: Date;
  endTime: Date;
  duration: number;
  success: boolean;
  attempts: number;
  objectId?: string;
  data?:
    | QuestionInteractionData
    | ProcedureInteractionData
    | TextInteractionData
    | Record<string, unknown>;
}

// Type pour les interactions enrichies avec les métadonnées résolues
export interface ResolvedInteraction extends InteractionData {
  resolvedData?: {
    // Pour questions
    questionText?: string;
    options?: string[];
    feedback?: string;

    // Pour procédures
    procedureTitle?: string;
    procedureDescription?: string;
    steps?: Array<{
      stepNumber: number;
      title: string;
      instruction: string;
      hint?: string;
    }>;

    // Pour texte
    textTitle?: string;
    textSubtitle?: string;
    textContent?: string;
  };
}

export interface TrainingAnalytics {
  id: string;
  sessionId: string;
  trainingId: string;
  buildName: string;
  buildType: string;
  buildVersion?: string; // Version du build (défaut: "1.0.0" pour anciennes données)
  user: {
    id: string;
    email: string;
    name?: string | null;
    firstName?: string | null;
    image?: string | null;
  };
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  completionStatus: CompletionStatus;
  score: number; // Score Unity (0-100)
  totalInteractions: number;
  successfulInteractions: number;
  failedInteractions: number;
  interactions: InteractionData[] | ResolvedInteraction[]; // Peut être enrichi
  metadata?: FormationMetadata | null;
  displayName?: string;
  imageUrl?: string;
}

export interface AnalyticsAggregates {
  totalSessions: number;
  averageDuration: number;
  averageScore: number; // Remplacement de averageSuccessRate
  totalInteractions: number;
  totalSuccessful: number;
  totalFailed: number;
  statusBreakdown: Record<string, number>;
  mostFailedQuestions: Array<{
    questionText: string;
    failureRate: number;
    attemptCount: number;
  }>;
}

export interface AnalyticsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AnalyticsResponse {
  analytics: TrainingAnalytics[];
  pagination: AnalyticsPagination;
  aggregates: AnalyticsAggregates;
}

export interface TagWithStats extends TrainingTag {
  memberCount: number;
  assignments: MemberTag[];
  isAssigned: boolean;
  isOverdue: boolean;
}

// Types pour les composants analytics
export interface AnalyticsSession {
  session: TrainingAnalytics | null;
  visible: boolean;
}

export interface UserAnalyticsStats {
  totalSessions: number;
  completedSessions: number;
  avgScore: number; // Remplacement de avgSuccessRate
  totalTime: number;
}

export interface BuildAnalyticsStats {
  buildName: string;
  totalSessions: number;
  avgScore: number; // Remplacement de avgSuccessRate
  avgDuration: number;
  completedSessions: number;
  participants: Set<string>;
}

// Types pour l'analyse détaillée des formations (training-metrics)
export interface QuestionUserResponse {
  userId: string;
  userName: string;
  success: boolean;
  attempts: number;
  userAnswers?: number[][];
  firstAttemptCorrect: boolean;
}

export interface QuestionStats {
  text: string;
  totalAttempts: number;
  successCount: number;
  failCount: number;
  options: string[];
  correctAnswers: number[];
  userResponses: QuestionUserResponse[];
}

export interface ProcedureStats {
  title: string;
  totalAttempts: number;
  successCount: number;
  failCount: number;
  totalDuration: number;
  avgDuration?: number;
  steps: string[];
}

export interface TrainingStatsWithQuestions {
  buildName: string;
  displayName?: string;
  imageUrl?: string;
  metadata?: FormationMetadata | null;
  uniqueUsers: Set<string>;
  sessions: TrainingAnalytics[];
  totalDuration: number;
  averageScore: number; // Remplacement de averageSuccessRate
  completedCount: number;
  allQuestions: Map<string, QuestionStats>;
  allProcedures?: Map<string, ProcedureStats>;
  // Calculated fields
  averageDuration?: number;
  completionRate?: number;
  uniqueUsersCount?: number;
  questionsArray?: QuestionStats[];
  proceduresArray?: ProcedureStats[];
}

export interface TrainingDetails {
  trainingName: string;
  visible: boolean;
  data: TrainingStatsWithQuestions | null;
}
