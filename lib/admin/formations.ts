import { prisma } from "@/lib/prisma";
import { listBuilds } from "@/lib/azure";
import { getFormationMetadata } from "./metadata-service";
import { BuildType } from "@/types/azure";
import { AdminFormation } from "@/types/admin";

export { AdminFormation };

export async function getAllFormations(): Promise<AdminFormation[]> {
  const formations: AdminFormation[] = [];

  // Récupérer toutes les organisations avec leurs containers
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      azureContainerId: true,
    },
  });

  // Récupérer tous les containers personnels
  const users = await prisma.user.findMany({
    where: {
      azureContainerId: { not: null },
    },
    select: {
      id: true,
      email: true,
      azureContainerId: true,
    },
  });

  // Parcourir les containers d'organisations
  for (const org of organizations) {
    try {
      const wisetrainerBuilds = await listBuilds(org.azureContainerId, "wisetrainer");
      const wisetourBuilds = await listBuilds(org.azureContainerId, "wisetour");

      const allBuilds = [...wisetrainerBuilds, ...wisetourBuilds];
      
      for (const build of allBuilds) {
        // Vérifier la présence des métadonnées
        let hasMetadata = false;
        let title: string | undefined;
        
        try {
          const metadataResult = await getFormationMetadata({
            containerId: org.azureContainerId,
            buildType: build.buildType,
            buildName: build.name,
          });
          
          hasMetadata = metadataResult.exists && !metadataResult.error;
          title = metadataResult.metadata?.title;
        } catch (error) {
          console.error(`Erreur vérification métadonnées ${build.name}:`, error);
        }

        formations.push({
          id: `${org.azureContainerId}-${build.buildType}-${build.name}`,
          name: build.name,
          buildType: build.buildType,
          containerId: org.azureContainerId,
          containerType: 'organization',
          organizationName: org.name,
          lastModified: build.lastModified,
          hasMetadata,
          title,
        });
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des builds pour l'organisation ${org.name}:`, error);
    }
  }

  // Parcourir les containers personnels
  for (const user of users) {
    if (!user.azureContainerId) continue;

    try {
      const wisetrainerBuilds = await listBuilds(user.azureContainerId, "wisetrainer");
      const wisetourBuilds = await listBuilds(user.azureContainerId, "wisetour");

      const allBuilds = [...wisetrainerBuilds, ...wisetourBuilds];
      
      for (const build of allBuilds) {
        // Vérifier la présence des métadonnées
        let hasMetadata = false;
        let title: string | undefined;
        
        try {
          const metadataResult = await getFormationMetadata({
            containerId: user.azureContainerId!,
            buildType: build.buildType,
            buildName: build.name,
          });
          
          hasMetadata = metadataResult.exists && !metadataResult.error;
          title = metadataResult.metadata?.title;
        } catch (error) {
          console.error(`Erreur vérification métadonnées ${build.name}:`, error);
        }

        formations.push({
          id: `${user.azureContainerId}-${build.buildType}-${build.name}`,
          name: build.name,
          buildType: build.buildType,
          containerId: user.azureContainerId!,
          containerType: 'personal',
          userEmail: user.email,
          lastModified: build.lastModified,
          hasMetadata,
          title,
        });
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des builds pour l'utilisateur ${user.email}:`, error);
    }
  }

  // Trier par date de modification (plus récent en premier)
  formations.sort((a, b) => {
    const dateA = new Date(a.lastModified || 0).getTime();
    const dateB = new Date(b.lastModified || 0).getTime();
    return dateB - dateA;
  });

  return formations;
}