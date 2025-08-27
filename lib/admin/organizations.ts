import { prisma } from "@/lib/prisma";
import { AdminOrganization } from "@/types/admin";

export type { AdminOrganization };

export async function getAllOrganizations(): Promise<AdminOrganization[]> {
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      maxUsers: true,
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  // TODO: Compter les builds réels depuis Azure pour chaque organisation
  const orgsWithBuilds = await Promise.all(
    organizations.map(async (org) => {
      // Pour l'instant, on met 0, mais on pourrait appeler listBuilds pour compter
      const buildsCount = 0;

      return {
        id: org.id,
        name: org.name,
        description: org.description || undefined,
        azureContainerId: org.azureContainerId,
        maxUsers: org.maxUsers,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        owner: {
          id: org.owner.id,
          name: org.owner.name || undefined,
          email: org.owner.email,
        },
        membersCount: org._count.members + 1, // +1 pour inclure le propriétaire
        buildsCount,
        invitationsCount: org._count.invitations,
      };
    })
  );

  return orgsWithBuilds;
}

export async function getOrganizationById(orgId: string): Promise<AdminOrganization | null> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      description: true,
      maxUsers: true,
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

  if (!org) return null;

  return {
    id: org.id,
    name: org.name,
    description: org.description || undefined,
    azureContainerId: org.azureContainerId,
    maxUsers: org.maxUsers,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    owner: {
      id: org.owner.id,
      name: org.owner.name || undefined,
      email: org.owner.email,
    },
    membersCount: org._count.members + 1, // +1 pour inclure le propriétaire
    buildsCount: 0, // TODO: Compter depuis Azure
    invitationsCount: org._count.invitations,
  };
}

export async function updateOrganizationMaxUsers(orgId: string, maxUsers: number): Promise<AdminOrganization | null> {
  const updatedOrg = await prisma.organization.update({
    where: { id: orgId },
    data: { maxUsers },
    select: {
      id: true,
      name: true,
      description: true,
      maxUsers: true,
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

  return {
    id: updatedOrg.id,
    name: updatedOrg.name,
    description: updatedOrg.description || undefined,
    azureContainerId: updatedOrg.azureContainerId,
    maxUsers: updatedOrg.maxUsers,
    createdAt: updatedOrg.createdAt,
    updatedAt: updatedOrg.updatedAt,
    owner: {
      id: updatedOrg.owner.id,
      name: updatedOrg.owner.name || undefined,
      email: updatedOrg.owner.email,
    },
    membersCount: updatedOrg._count.members,
    buildsCount: 0,
    invitationsCount: updatedOrg._count.invitations,
  };
}