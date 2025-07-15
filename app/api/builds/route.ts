import { NextResponse } from "next/server";
import { listBuilds, BuildType, Build } from "@/lib/azure";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-wrapper";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const buildType = searchParams.get("type") as BuildType;
    const containerId = searchParams.get("containerId");
    const followedOnly = searchParams.get("followedOnly") === "true";

    if (!buildType) {
      return NextResponse.json(
        { error: "Missing type parameter" },
        { status: 400 }
      );
    }

    if (buildType !== "wisetour" && buildType !== "wisetrainer") {
      return NextResponse.json(
        { error: "Invalid build type. Must be 'wisetour' or 'wisetrainer'" },
        { status: 400 }
      );
    }

    if (!containerId) {
      return NextResponse.json(
        { error: "Missing containerId parameter" },
        { status: 400 }
      );
    }

    // Vérifier si c'est un container personnel
    if (containerId.startsWith("personal-")) {
      // Vérifier que l'utilisateur a accès à ce container personnel
      if (containerId !== req.user.azureContainerId) {
        return NextResponse.json(
          { error: "You don't have access to this personal container" },
          { status: 403 }
        );
      }
    } else {
      // C'est un container d'organisation, vérifier l'accès
      const org = await prisma.organization.findFirst({
        where: { azureContainerId: containerId },
      });

      if (!org) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        );
      }

      // Vérifier si l'utilisateur a accès à cette organisation
      const hasAccess = await prisma.organizationMember.findFirst({
        where: {
          organizationId: org.id,
          userId: req.user.id,
        },
      });

      if (!hasAccess && org.ownerId !== req.user.id) {
        return NextResponse.json(
          { error: "You don't have access to this organization" },
          { status: 403 }
        );
      }
    }

    // Si on veut seulement les formations suivies, récupérer les builds suivis
    let followedBuildNames: Set<string> = new Set();
    if (followedOnly) {
      const followedBuilds = await prisma.userBuild.findMany({
        where: {
          userId: req.user.id,
          buildType: buildType.toUpperCase() as any, // Convert to Prisma enum
          containerId: containerId,
        },
        select: {
          buildName: true,
        },
      });
      followedBuildNames = new Set(followedBuilds.map((fb) => fb.buildName));
    }

    // Lister les builds depuis Azure
    const azureBuilds: Build[] = await listBuilds(containerId, buildType);

    // Créer un map des builds Azure par nom pour faciliter la recherche
    const azureBuildsByName = new Map<string, Build>();
    azureBuilds.forEach((build) => {
      azureBuildsByName.set(build.name, build);
    });

    // Lister tous les fichiers JSON disponibles dans le dossier data
    const dataDir = path.join(process.cwd(), "data", buildType);
    const enrichedBuilds: Build[] = [];
    const processedBuildNames = new Set<string>();

    // Lire tous les fichiers JSON dans le dossier data
    let jsonFiles: string[] = [];
    try {
      if (fs.existsSync(dataDir)) {
        jsonFiles = fs
          .readdirSync(dataDir)
          .filter((file) => file.endsWith(".json"));
      }
    } catch (e) {
      console.warn(`Error reading data directory ${dataDir}:`, e);
    }

    // Traiter chaque fichier JSON
    for (const jsonFile of jsonFiles) {
      const buildName = jsonFile.replace(".json", "");
      const filePath = path.join(dataDir, jsonFile);

      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const localData = JSON.parse(fileContent);

        // Récupérer le nom enrichi ou utiliser le nom du fichier
        const enrichedName = localData.name || buildName;

        // Si on veut seulement les formations suivies, vérifier si ce build est suivi
        // On vérifie à la fois le nom du fichier et le nom enrichi
        if (
          followedOnly &&
          !followedBuildNames.has(buildName) &&
          !followedBuildNames.has(enrichedName)
        ) {
          continue;
        }

        // Vérifier si un build Azure existe pour ce nom
        const azureBuild = azureBuildsByName.get(buildName);

        if (azureBuild) {
          // Build existe dans Azure, on l'enrichit
          const enrichedBuild = { ...azureBuild };
          Object.assign(enrichedBuild, localData);
          enrichedBuilds.push(enrichedBuild);
        } else {
          // Pas de build Azure, créer un build virtuel basé sur le JSON
          const virtualBuild: Build = {
            name: enrichedName, // Utiliser le nom enrichi
            buildType: buildType,
            files: {
              // Fichiers virtuels pour indiquer que c'est un build de démo
              loader: {
                name: `${buildName}.loader.js`,
                url: `/demo/builds/${buildType}/${buildName}.loader.js`,
                size: 1024 * 50, // 50KB fictif
                lastModified: new Date(),
              },
              framework: {
                name: `${buildName}.framework.js.gz`,
                url: `/demo/builds/${buildType}/${buildName}.framework.js.gz`,
                size: 1024 * 1024 * 2, // 2MB fictif
                lastModified: new Date(),
              },
              wasm: {
                name: `${buildName}.wasm.gz`,
                url: `/demo/builds/${buildType}/${buildName}.wasm.gz`,
                size: 1024 * 1024 * 5, // 5MB fictif
                lastModified: new Date(),
              },
              data: {
                name: `${buildName}.data.gz`,
                url: `/demo/builds/${buildType}/${buildName}.data.gz`,
                size: 1024 * 1024 * 10, // 10MB fictif
                lastModified: new Date(),
              },
            },
            totalSize: 1024 * 1024 * 17, // ~17MB total fictif
            lastModified: new Date(),
            // Ajouter les données JSON enrichies
            ...localData,
          };

          enrichedBuilds.push(virtualBuild);
        }

        processedBuildNames.add(buildName);
      } catch (e) {
        console.error(
          `Error reading or parsing local data for ${jsonFile}:`,
          e
        );
      }
    }

    // Ajouter les builds Azure qui n'ont pas de fichier JSON correspondant
    for (const azureBuild of azureBuilds) {
      if (!processedBuildNames.has(azureBuild.name)) {
        // Si on veut seulement les formations suivies, vérifier si ce build est suivi
        if (followedOnly && !followedBuildNames.has(azureBuild.name)) {
          continue;
        }
        enrichedBuilds.push(azureBuild);
      }
    }

    // Trier par nom pour un affichage cohérent
    enrichedBuilds.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ builds: enrichedBuilds });
  } catch (error) {
    console.error("Error fetching builds:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch builds",
      },
      { status: 500 }
    );
  }
});
