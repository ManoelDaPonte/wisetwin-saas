import { prisma } from "@/lib/prisma";

export interface AdminOrganization {
  id: string;
  name: string;
  description?: string;
  azureContainerId: string;
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
}

export async function getAllOrganizations(): Promise<AdminOrganization[]> {
  const organizations = await prisma.organization.findMany({
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
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        owner: {
          id: org.owner.id,
          name: org.owner.name || undefined,
          email: org.owner.email,
        },
        membersCount: org._count.members,
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
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    owner: {
      id: org.owner.id,
      name: org.owner.name || undefined,
      email: org.owner.email,
    },
    membersCount: org._count.members,
    buildsCount: 0, // TODO: Compter depuis Azure
    invitationsCount: org._count.invitations,
  };
}