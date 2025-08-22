"use client";

import { Unity, useUnityContext } from "react-unity-webgl";
import { useEffect, useCallback } from "react";
import { BuildUrls } from "@/types/azure";
import { toast } from "sonner";

interface Unity3DViewerProps {
	buildUrls: BuildUrls;
	buildName?: string;
	buildType?: string;
	containerId?: string;
	enableCompletion?: boolean;
}

export function Unity3DViewer({
	buildUrls,
	buildName,
	buildType,
	containerId,
	enableCompletion = false,
}: Unity3DViewerProps) {
	const {
		unityProvider,
		isLoaded,
		loadingProgression,
		addEventListener,
		removeEventListener,
	} = useUnityContext({
		loaderUrl: buildUrls["loader"],
		dataUrl: buildUrls["data"],
		frameworkUrl: buildUrls["framework"],
		codeUrl: buildUrls["wasm"],
	});

	// Fonction pour appeler l'API formations/completed
	const handleFormationCompleted = useCallback(async () => {
		if (!buildName || !buildType || !containerId) {
			console.error(
				"Missing required parameters for formation completion"
			);
			return;
		}

		try {
			const response = await fetch("/api/formations/completed", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					buildName,
					buildType,
					containerId,
				}),
			});

			if (response.ok) {
				const result = await response.json();
				console.log("Formation completed:", result);
				toast.success("Formation complétée !");
			} else {
				const error = await response.json();
				console.error("Error:", error);
				toast.error("Erreur lors de la completion");
			}
		} catch (error) {
			console.error("Network error:", error);
		}
	}, [buildName, buildType, containerId]);

	// EventListener pour écouter les messages de Unity (seulement si enableCompletion est true)
	useEffect(() => {
		if (!enableCompletion) return;

		addEventListener("FormationCompleted", handleFormationCompleted);

		return () => {
			removeEventListener(
				"FormationCompleted",
				handleFormationCompleted
			);
		};
	}, [addEventListener, removeEventListener, handleFormationCompleted, enableCompletion]);

	return (
		<div className="relative w-full h-full">
			{!isLoaded && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
					<div className="text-center">
						<p>
							Chargement : {Math.round(loadingProgression * 100)}%
						</p>
					</div>
				</div>
			)}
			<Unity
				unityProvider={unityProvider}
				style={{ width: "100%", height: "100%" }}
			/>
		</div>
	);
}
