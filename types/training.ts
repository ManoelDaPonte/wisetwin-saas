// Types pour le système de gestion de formations

export type TrainingStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";

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
  completions?: TrainingCompletion[];
  _count?: {
    completions: number;
  };
}

export interface TrainingCompletion {
  id: string;
  buildTagId: string;
  userId: string;
  status: TrainingStatus;
  startedAt?: Date | null;
  completedAt?: Date | null;
  lastReminderSent?: Date | null;
  reminderCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations optionnelles
  buildTag?: BuildTag;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
}

export interface TrainingAssignment {
  id: string;
  userId: string;
  tagId: string;
  buildName: string;
  buildType: "WISETOUR" | "WISETRAINER";
  containerId: string;
  dueDate?: Date | null;
  isRequired: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: TrainingStatus;
  assignedById: string;
  createdAt: Date;
  updatedAt: Date;
  
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

// === TYPES POUR LES FORMULAIRES ===

export interface CreateTrainingTagData {
  name: string;
  color?: string;
  description?: string;
  dueDate?: string;
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
    title?: string;
    description?: string;
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

export interface TrainingProgressResponse {
  completions: TrainingCompletion[];
  total: number;
  stats: {
    notStarted: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
}

// === TYPES POUR LES VUES DASHBOARD ===

// TrainingOverviewStats supprimé car non utilisé
// TagWithStats supprimé car non utilisé

export interface AssignmentWithProgress extends TrainingAssignment {
  progress: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    overdue: number;
    completionRate: number;
  };
  recentCompletions: Array<{
    userId: string;
    userName: string | null;
    userEmail: string;
    completedAt: Date;
  }>;
}

export interface MemberWithTrainings {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  tags: TrainingTag[];
  assignments: Array<{
    id: string;
    buildName: string;
    buildType: "WISETOUR" | "WISETRAINER";
    status: TrainingStatus;
    dueDate?: Date | null;
    isRequired: boolean;
    assignedAt: Date;
    completedAt?: Date | null;
  }>;
  stats: {
    totalAssignments: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  };
}

// === TYPES POUR L'EXPORT ===

// ExportTrainingData supprimé car non utilisé
// ExportOptions supprimé car non utilisé