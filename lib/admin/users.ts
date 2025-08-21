import { prisma } from "@/lib/prisma";
import { AdminUser } from "@/types/admin";

export { AdminUser };

export async function getAllUsers(): Promise<AdminUser[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      azureContainerId: true,
      createdAt: true,
      emailVerified: true,
      _count: {
        select: {
          organizations: true,
          followedBuilds: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users.map(user => ({
    id: user.id,
    name: user.name || undefined,
    email: user.email,
    image: user.image || undefined,
    azureContainerId: user.azureContainerId || undefined,
    createdAt: user.createdAt,
    emailVerified: user.emailVerified || undefined,
    organizationsCount: user._count.organizations,
    buildsCount: user._count.followedBuilds,
    lastLogin: undefined, // TODO: Ajouter tracking login si nécessaire
  }));
}

export async function getUserById(userId: string): Promise<AdminUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      azureContainerId: true,
      createdAt: true,
      emailVerified: true,
      _count: {
        select: {
          organizations: true,
          followedBuilds: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name || undefined,
    email: user.email,
    image: user.image || undefined,
    azureContainerId: user.azureContainerId || undefined,
    createdAt: user.createdAt,
    emailVerified: user.emailVerified || undefined,
    organizationsCount: user._count.organizations,
    buildsCount: user._count.followedBuilds,
    lastLogin: undefined,
  };
}