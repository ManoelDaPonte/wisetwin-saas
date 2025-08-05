import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { canAccessAdminPanel } from "@/lib/admin/permissions";

export interface SuperAdminRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export function withSuperAdmin(
  handler: (req: SuperAdminRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const session = await getServerSession();

      if (!session?.user?.email) {
        return NextResponse.json(
          { error: "Authentification requise" },
          { status: 401 }
        );
      }

      if (!canAccessAdminPanel(session.user.email)) {
        return NextResponse.json(
          { error: "Accès refusé - Super-admin requis" },
          { status: 403 }
        );
      }

      // Ajouter les infos utilisateur à la requête
      const superAdminReq = req as SuperAdminRequest;
      superAdminReq.user = {
        id: session.user.id as string,
        email: session.user.email,
        name: session.user.name || undefined,
      };

      return await handler(superAdminReq);
    } catch (error) {
      console.error("Erreur middleware super-admin:", error);
      return NextResponse.json(
        { error: "Erreur serveur" },
        { status: 500 }
      );
    }
  };
}