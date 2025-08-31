// Types pour l'administration

export interface AdminUser {
  id: string;
  name?: string;
  email: string;
  image?: string;
  azureContainerId?: string;
  createdAt: Date;
  emailVerified?: Date;
  organizationsCount: number;
  buildsCount: number;
  lastLogin?: Date;
  [key: string]: unknown;
}

export interface AdminOrganization {
  id: string;
  name: string;
  description?: string;
  azureContainerId: string;
  maxUsers: number;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    name?: string;
    email: string;
  };
  membersCount: number;
  buildsCount: number;
  invitationsCount: number;
  [key: string]: unknown;
}

export interface AdminFormation {
  id: string;
  name: string;
  buildType: "wisetour" | "wisetrainer";
  containerId: string;
  containerType: 'personal' | 'organization';
  organizationName?: string;
  userEmail?: string;
  lastModified?: Date;
  hasMetadata: boolean;
  title?: string; // Titre depuis les métadonnées
  [key: string]: unknown; // Index signature pour compatibilité avec Record<string, unknown>
}

export interface MetadataService {
  getMetadata: (containerId: string, buildName: string) => Promise<any>;
  updateMetadata: (
    containerId: string,
    buildName: string,
    metadata: any
  ) => Promise<void>;
  validateMetadata: (metadata: any) => boolean;
}