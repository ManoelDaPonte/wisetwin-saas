import { NextResponse } from "next/server";
import { withOrgAuth, OrgAuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";

// GET /api/training-management/member-tags/[memberTagId] - Récupérer un member-tag spécifique
export const GET = withOrgAuth(async (request: OrgAuthenticatedRequest, { params }: { params: Promise<{ memberTagId: string }> }) => {
  try {
    const { memberTagId } = await params;

    const memberTag = await prisma.memberTag.findFirst({
      where: {
        id: memberTagId,
        tag: {
          organizationId: request.organization.id,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tag: {
          select: {
            id: true,
            name: true,
            color: true,
            description: true,
            organizationId: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!memberTag) {
      return NextResponse.json(
        { error: "Assignment tag-membre non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(memberTag);
  } catch (error) {
    console.error("Erreur lors de la récupération du member-tag:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération" },
      { status: 500 }
    );
  }
});

// DELETE /api/training-management/member-tags/[memberTagId] - Supprimer un assignment tag-membre
export const DELETE = withOrgAuth(async (request: OrgAuthenticatedRequest, { params }: { params: Promise<{ memberTagId: string }> }) => {
  try {
    // Vérification des permissions (ADMIN ou OWNER seulement)
    if (request.organization.role === "MEMBER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour retirer des tags" },
        { status: 403 }
      );
    }

    const { memberTagId } = await params;

    // Vérifier que l'assignment existe et appartient à l'organisation
    const existingMemberTag = await prisma.memberTag.findFirst({
      where: {
        id: memberTagId,
        tag: {
          organizationId: request.organization.id,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!existingMemberTag) {
      return NextResponse.json(
        { error: "Assignment tag-membre non trouvé" },
        { status: 404 }
      );
    }

    // Suppression de l'assignment
    await prisma.memberTag.delete({
      where: { id: memberTagId },
    });

    return NextResponse.json({
      message: "Tag retiré avec succès",
      user: existingMemberTag.user,
      tag: existingMemberTag.tag,
    }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression du member-tag:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression" },
      { status: 500 }
    );
  }
});