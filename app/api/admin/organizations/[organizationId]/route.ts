import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { canAccessAdminPanel } from "@/lib/admin/permissions";
import { prisma } from "@/lib/prisma";

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
    const { name, description } = await req.json();

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Le nom est requis" },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: "Le nom ne peut pas dépasser 100 caractères" },
        { status: 400 }
      );
    }

    if (description && typeof description === 'string' && description.length > 500) {
      return NextResponse.json(
        { error: "La description ne peut pas dépasser 500 caractères" },
        { status: 400 }
      );
    }

    // Vérifier si l'organisation existe
    const existingOrg = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!existingOrg) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour l'organisation
    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        azureContainerId: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            invitations: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      organization: {
        id: updatedOrganization.id,
        name: updatedOrganization.name,
        description: updatedOrganization.description || undefined,
        azureContainerId: updatedOrganization.azureContainerId,
        createdAt: updatedOrganization.createdAt,
        updatedAt: updatedOrganization.updatedAt,
        owner: {
          id: updatedOrganization.owner.id,
          name: updatedOrganization.owner.name || undefined,
          email: updatedOrganization.owner.email,
        },
        membersCount: updatedOrganization._count.members,
        buildsCount: 0,
        invitationsCount: updatedOrganization._count.invitations,
      },
      updatedBy: session.user.email
    });
  } catch (error) {
    console.error("Erreur mise à jour organisation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'organisation" },
      { status: 500 }
    );
  }
}