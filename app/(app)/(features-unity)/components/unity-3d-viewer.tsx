"use client";

import { Unity, useUnityContext } from "react-unity-webgl";
import { useContainer } from "@/app/hooks/use-container";
import { usePathname } from "next/navigation";
import { useMemo, useEffect, useState } from "react";

type BuildType = "wisetour" | "wisetrainer";

interface Unity3DViewerProps {
	buildId: string;
	buildType?: BuildType;
}

interface BuildUrls {
	loader: string;
	framework: string;
	wasm: string;
	data: string;
}

export function Unity3DViewer({ buildId, buildType }: Unity3DViewerProps) {
	const { containerId } = useContainer();
	const pathname = usePathname();
	const [error, setError] = useState<string | null>(null);

	// Détecter automatiquement le buildType depuis l'URL si non fourni
	const detectedBuildType: BuildType = useMemo(() => {
		if (buildType) return buildType;
		if (pathname.includes("/wisetour/")) return "wisetour";
		if (pathname.includes("/wisetrainer/")) return "wisetrainer";
		return "wisetrainer"; // fallback
	}, [buildType, pathname]);

	// Générer les URLs vers l'API builds/urls
	const buildUrls = useMemo(() => {
		if (!containerId) return null;

		const baseParams = `containerId=${encodeURIComponent(containerId)}&buildType=${detectedBuildType}&buildId=${encodeURIComponent(buildId)}`;

		return {
			loader: `/api/builds/urls?${baseParams}&fileType=loader.js`,
			framework: `/api/builds/urls?${baseParams}&fileType=framework.js`,
			wasm: `/api/builds/urls?${baseParams}&fileType=wasm`,
			data: `/api/builds/urls?${baseParams}&fileType=data`,
		};
	}, [containerId, detectedBuildType, buildId]);

	// Configuration Unity WebGL avec les URLs
	const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
		loaderUrl: buildUrls?.loader || "",
		dataUrl: buildUrls?.data || "",
		frameworkUrl: buildUrls?.framework || "",
		codeUrl: buildUrls?.wasm || "",
	});

	// Gestion simple des états
	if (!containerId) {
		return (
			<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
				<p className="text-red-500">Container non disponible</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
				<p className="text-red-500">Erreur: {error}</p>
			</div>
		);
	}

	return (
		<div className="relative w-full h-full">
			{!isLoaded && (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
					<div className="text-center">
						<p>
							Chargement: {Math.round(loadingProgression * 100)}%
						</p>
						<div className="w-48 h-2 bg-gray-200 rounded mt-2">
							<div
								className="h-full bg-blue-500 rounded"
								style={{
									width: `${loadingProgression * 100}%`,
								}}
							/>
						</div>
					</div>
				</div>
			)}
			<Unity 
				unityProvider={unityProvider} 
				style={{ 
					width: "100%", 
					height: "100%",
					display: "block"
				}}
			/>
		</div>
	);
}
