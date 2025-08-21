// Types pour l'authentification et les sessions
import { NextRequest } from "next/server";

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name: string | null;
    azureContainerId?: string;
  };
}

export interface OrgAuthenticatedRequest extends AuthenticatedRequest {
  organization: {
    id: string;
    azureContainerId: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    name: string;
    description: string | null;
    ownerId: string;
  };
}

export interface SuperAdminRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export type RouteHandler = (
  request: AuthenticatedRequest,
  context?: any
) => Promise<Response> | Response;

export type OrgRouteHandler = (
  request: OrgAuthenticatedRequest,
  context?: any
) => Promise<Response> | Response;

export type Role = "OWNER" | "ADMIN" | "MEMBER";

export interface OrgAccess {
  hasAccess: boolean;
  role?: Role;
}