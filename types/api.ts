// Types pour les réponses API et requêtes

import { BuildType } from "./azure";
import { Member, Invitation } from "./organization";
import { AdminUser, AdminOrganization, AdminFormation } from "./admin";
import { CompletedFormation } from "./azure";

// Réponses API génériques
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Réponses spécifiques
export interface MembersResponse {
  members: Member[];
  invitations: Invitation[];
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  requestedBy: string;
}

export interface AdminOrganizationsResponse {
  organizations: AdminOrganization[];
  total: number;
  requestedBy: string;
}

export interface AdminFormationsResponse {
  formations: AdminFormation[];
  total: number;
}

export interface CompletedFormationsResponse {
  completions: CompletedFormation[];
  total: number;
}

export interface BuildResponse {
  builds: any[];
  total: number;
}

export interface MetadataResponse {
  exists: boolean;
  metadata?: any;
  error?: string;
}

// Types pour les paramètres de requête
export interface BuildsOptions {
  buildType?: BuildType;
  containerId?: string;
  followedOnly?: boolean;
}

export interface CompletedFormationsOptions {
  buildType?: BuildType;
}

export interface MetadataParams {
  containerId: string;
  buildType: BuildType;
  buildName: string;
}

// Types pour les mutations
export interface UpdateUserData {
  name: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountData {
  password: string;
}

export interface UpdateOrganizationData {
  name: string;
  description?: string;
}

export interface TransferOwnershipData {
  newOwnerId: string;
}

export interface MarkCompletedParams {
  buildName: string;
  buildType: BuildType;
  containerId: string;
  progress?: number;
}

// Types pour la stratégie de prefetch
export interface PrefetchStrategy {
  delay: number;
  prefetch: () => void;
}