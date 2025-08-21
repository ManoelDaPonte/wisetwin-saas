// Types pour les organisations et membres

export type Role = "OWNER" | "ADMIN" | "MEMBER";

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  role: Role;
  azureContainerId?: string;
}

export interface Member {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  joinedAt: string;
  avatarUrl?: string | null;
  isOwner: boolean;
}

export interface Invitation {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
}

export interface InvitationEmailData {
  email: string;
  organizationName: string;
  inviterName: string;
  token: string;
  code: string;
  role: "ADMIN" | "MEMBER";
  expiresAt: Date;
}