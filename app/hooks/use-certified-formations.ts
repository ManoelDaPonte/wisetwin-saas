import { useQuery } from "@tanstack/react-query";
import { useContainer } from "./use-container";
import { useSession } from "next-auth/react";
import { Build } from "@/types/azure";

interface CertifiedFormation {
  build: Build;
  score: number;
  completedAt: string;
  isFirstSuccess: boolean;
}

const CERTIFICATION_THRESHOLD = 80; // Score minimum pour la certification

async function fetchCertifiedFormations(
  containerId: string,
  organizationId: string | null,
  userId: string
): Promise<CertifiedFormation[]> {
  // Récupérer tous les analytics de l'utilisateur
  const analyticsParams = new URLSearchParams({
    containerId,
    userId,
    completionStatus: "COMPLETED",
  });

  if (organizationId) {
    analyticsParams.append("organizationId", organizationId);
  }

  const analyticsResponse = await fetch(`/api/analytics/user?${analyticsParams.toString()}`);

  if (!analyticsResponse.ok) {
    // Si l'endpoint n'existe pas encore, utiliser une logique alternative
    return fetchCertifiedFormationsAlternative(containerId, organizationId, userId);
  }

  const analytics = await analyticsResponse.json();

  // Grouper par formation et ne garder que le meilleur score > 80%
  const certificationsByBuild = new Map<string, CertifiedFormation>();

  analytics.sessions?.forEach((session: {
    buildName: string;
    buildType: string;
    successRate: number;
    endTime: string;
  }) => {
    if (session.successRate >= CERTIFICATION_THRESHOLD) {
      const key = `${session.buildName}-${session.buildType}`;

      // Garder le meilleur score, ou le plus récent si scores identiques
      const existing = certificationsByBuild.get(key);
      if (!existing ||
          session.successRate > existing.score ||
          (session.successRate === existing.score && new Date(session.endTime) > new Date(existing.completedAt))) {
        certificationsByBuild.set(key, {
          build: {
            name: session.buildName,
            buildType: session.buildType.toLowerCase(),
            // Les autres données du build seront enrichies plus tard
          } as Build,
          score: session.successRate,
          completedAt: session.endTime,
          isFirstSuccess: !existing, // Première réussite si pas d'existant
        });
      }
    }
  });

  // Enrichir avec les données des builds
  if (certificationsByBuild.size > 0) {
    // Récupérer tous les builds WiseTrainer
    const buildsResponse = await fetch(
      `/api/builds?containerId=${containerId}&type=wisetrainer`
    );

    if (buildsResponse.ok) {
      const buildsData = await buildsResponse.json();
      const builds = buildsData.builds || [];

      // Enrichir les certifications avec les données complètes des builds
      certificationsByBuild.forEach((cert) => {
        const build = builds.find((b: Build) =>
          b.name === cert.build.name || b.id === cert.build.name
        );
        if (build) {
          cert.build = build;
        }
      });
    }
  }

  return Array.from(certificationsByBuild.values())
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

// Fonction alternative si l'API analytics n'existe pas encore
async function fetchCertifiedFormationsAlternative(
  containerId: string,
  _organizationId: string | null,
  _userId: string
): Promise<CertifiedFormation[]> {
  try {
    // Essayer de récupérer les stats utilisateur pour avoir les scores
    const statsResponse = await fetch(`/api/user/stats?containerId=${containerId}&userId=${_userId}`);

    if (!statsResponse.ok) {
      return [];
    }

    const stats = await statsResponse.json();

    // Récupérer les builds pour avoir les métadonnées complètes
    const buildsResponse = await fetch(
      `/api/builds?containerId=${containerId}&type=wisetrainer`
    );

    if (!buildsResponse.ok) {
      return [];
    }

    const buildsData = await buildsResponse.json();
    const builds = buildsData.builds || [];

    // Utiliser l'activité récente qui contient les scores
    const processedBuilds = new Map<string, CertifiedFormation>();

    // Filtrer les activités avec score >= 80%
    stats.recentActivity?.forEach((activity: {
      buildName: string;
      score?: number;
      timestamp: string;
      buildType: string;
    }) => {
      if (activity.score && activity.score >= CERTIFICATION_THRESHOLD && activity.buildType === 'wisetrainer') {
        const key = activity.buildName;
        const existing = processedBuilds.get(key);

        // Garder le meilleur score ou le plus récent si scores identiques
        if (!existing ||
            activity.score > existing.score ||
            (activity.score === existing.score && new Date(activity.timestamp) > new Date(existing.completedAt))) {

          const build = builds.find((b: Build) =>
            b.name === activity.buildName || b.id === activity.buildName
          );

          if (build) {
            processedBuilds.set(key, {
              build,
              score: activity.score,
              completedAt: activity.timestamp,
              isFirstSuccess: !existing,
            });
          }
        }
      }
    });

    return Array.from(processedBuilds.values())
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  } catch (error) {
    console.error("Error in fetchCertifiedFormationsAlternative:", error);
    return [];
  }
}

export function useCertifiedFormations() {
  const { containerId, organizationId, isReady } = useContainer();
  const { data: session } = useSession();

  const query = useQuery({
    queryKey: ["certifiedFormations", containerId, organizationId, session?.user?.id],
    queryFn: () => fetchCertifiedFormations(
      containerId!,
      organizationId,
      session?.user?.id || ''
    ),
    enabled: isReady && !!session?.user?.id && !!containerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    certifications: query.data || [],
  };
}