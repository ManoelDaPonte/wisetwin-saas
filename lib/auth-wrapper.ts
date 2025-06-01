import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

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
  };
}

type RouteHandler = (
  request: AuthenticatedRequest,
  context?: any
) => Promise<NextResponse> | NextResponse;

type OrgRouteHandler = (
  request: OrgAuthenticatedRequest,
  context?: any
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: RouteHandler) {
  return async (request: NextRequest, context?: any) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      
      // Add user to request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name,
        azureContainerId: session.user.azureContainerId
      };
      
      return handler(authenticatedRequest, context);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 500 }
      );
    }
  };
}

export function withOrgAuth(handler: OrgRouteHandler) {
  return withAuth(async (request: AuthenticatedRequest, context?: any) => {
    try {
      // Get organizationId from query params, body, or route params
      const url = new URL(request.url);
      let organizationId = url.searchParams.get("organizationId");
      
      // Try to get from route params if available (Next.js 15 requires await)
      if (!organizationId && context?.params) {
        const params = await context.params;
        organizationId = params.orgId;
      }
      
      if (!organizationId) {
        // Try to get from container ID if provided
        const containerId = url.searchParams.get("containerId");
        if (!containerId) {
          return NextResponse.json(
            { error: "Organization ID or Container ID required" },
            { status: 400 }
          );
        }
        
        // Find organization by container ID
        const org = await prisma.organization.findUnique({
          where: { azureContainerId: containerId }
        });
        
        if (!org) {
          return NextResponse.json(
            { error: "Organization not found" },
            { status: 404 }
          );
        }
        
        // Check if user has access
        const hasAccess = await checkOrgAccess(request.user.id, org.id);
        if (!hasAccess.hasAccess) {
          return NextResponse.json(
            { error: "Forbidden: You don't have access to this organization" },
            { status: 403 }
          );
        }
        
        // Add organization to request
        const orgRequest = request as OrgAuthenticatedRequest;
        orgRequest.organization = {
          id: org.id,
          azureContainerId: org.azureContainerId,
          role: hasAccess.role!
        };
        
        return handler(orgRequest, context);
      }
      
      // Check if user has access to organization
      const hasAccess = await checkOrgAccess(request.user.id, organizationId);
      if (!hasAccess.hasAccess) {
        return NextResponse.json(
          { error: "Forbidden: You don't have access to this organization" },
          { status: 403 }
        );
      }
      
      // Get organization details
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
      });
      
      if (!organization) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        );
      }
      
      // Add organization to request
      const orgRequest = request as OrgAuthenticatedRequest;
      orgRequest.organization = {
        id: organization.id,
        azureContainerId: organization.azureContainerId,
        role: hasAccess.role!
      };
      
      return handler(orgRequest, context);
    } catch (error) {
      console.error("Org auth middleware error:", error);
      return NextResponse.json(
        { error: "Organization authentication error" },
        { status: 500 }
      );
    }
  });
}

async function checkOrgAccess(userId: string, organizationId: string): Promise<{
  hasAccess: boolean;
  role?: "OWNER" | "ADMIN" | "MEMBER";
}> {
  // Check if user is owner
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      ownerId: userId
    }
  });
  
  if (organization) {
    return { hasAccess: true, role: "OWNER" };
  }
  
  // Check if user is member
  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId,
      organizationId
    }
  });
  
  if (membership) {
    return { hasAccess: true, role: membership.role as "ADMIN" | "MEMBER" };
  }
  
  return { hasAccess: false };
}