import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { canAccessAdminPanel } from "@/lib/admin/permissions";
import { updateOrganizationMaxUsers } from "@/lib/admin/organizations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
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

    const { organizationId } = await params;
    const { maxUsers } = await req.json();

    // Validation
    if (!maxUsers || typeof maxUsers !== 'number' || maxUsers < 1) {
      return NextResponse.json(
        { error: "La limite doit être un nombre supérieur à 0" },
        { status: 400 }
      );
    }

    if (maxUsers > 1000) {
      return NextResponse.json(
        { error: "La limite ne peut pas dépasser 1000 utilisateurs" },
        { status: 400 }
      );
    }

    const updatedOrganization = await updateOrganizationMaxUsers(organizationId, maxUsers);

    if (!updatedOrganization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      organization: updatedOrganization,
      updatedBy: session.user.email
    });
  } catch (error) {
    console.error("Erreur mise à jour limite utilisateurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la limite" },
      { status: 500 }
    );
  }
}