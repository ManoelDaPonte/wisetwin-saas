// Unity3DViewer.tsx - Version corrigée basée sur la documentation

"use client";

import { Unity, useUnityContext } from "react-unity-webgl";
import { useEffect, useCallback, useRef } from "react";
import { BuildUrls } from "@/types/azure";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

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

	// Utiliser useRef pour éviter les re-renders
	const hasProcessedRef = useRef<Set<string>>(new Set());

	// Fonction simplifiée pour recevoir les données de completion depuis Unity
	const handleTrainingCompleted = useCallback(
		async (jsonDataString: string) => {
			// Éviter les doublons
			const eventKey = `${Date.now()}-${jsonDataString.slice(0, 50)}`;
			if (hasProcessedRef.current.has(eventKey)) {
				console.log("Duplicate event ignored");
				return;
			}
			hasProcessedRef.current.add(eventKey);

			if (!buildName || !buildType || !containerId) {
				console.error(
					"Missing required parameters for training completion"
				);
				return;
			}

			try {
				// Parser les données JSON depuis Unity
				const analyticsData = JSON.parse(jsonDataString);
				console.log(
					"Training completion received from Unity:",
					analyticsData
				);

				// Récupérer un token d'authentification frais
				const tokenResponse = await fetch(
					`/api/unity/token?${new URLSearchParams({
						containerId,
						buildName,
						buildType,
					})}`
				);

				let authToken = null;
				if (tokenResponse.ok) {
					const data = await tokenResponse.json();
					authToken = data.token;
				}

				// Enrichir les données avec les infos de build et le token
				const enrichedData = {
					...analyticsData,
					buildName,
					buildType,
					containerId,
					authToken,
				};

				// Envoyer à l'API
				const response = await fetch("/api/unity/analytics", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(enrichedData),
				});

				if (response.ok) {
					const result = await response.json();
					console.log(
						"Training completion processed successfully:",
						result
					);

					// Vérifier si la formation est terminée
					if (analyticsData.completionStatus === "completed") {
						toast.success(
							"Formation terminée ! Les résultats ont été enregistrés."
						);
					}
				} else {
					const error = await response.json();
					console.error(
						"Error processing training completion:",
						error
					);
					toast.error("Erreur lors de l'envoi des résultats");
				}
			} catch (error) {
				console.error("Error processing training completion:", error);
				toast.error("Erreur lors du traitement des données");
			}
		},
		[buildName, buildType, containerId]
	);

	// Event listener simplifié - uniquement react-unity-webgl
	useEffect(() => {
		if (!enableCompletion) return;

		console.log(
			"Setting up Unity event listener for training completion..."
		);

		// Utiliser uniquement la méthode officielle react-unity-webgl
		addEventListener("TrainingCompleted", handleTrainingCompleted);

		return () => {
			removeEventListener("TrainingCompleted", handleTrainingCompleted);
			hasProcessedRef.current.clear();
		};
	}, [
		addEventListener,
		removeEventListener,
		handleTrainingCompleted,
		enableCompletion,
	]);

	return (
		<div className="relative w-full h-full">
			{!isLoaded && (
				<div className="absolute inset-0 z-10 flex items-center justify-center">
					<div className="flex items-center gap-3">
						<div className="space-y-1">
							<Progress
								value={Math.round(loadingProgression * 100)}
								className="h-2 w-48"
							/>
							<p className="text-sm text-muted-foreground text-center">
								{Math.round(loadingProgression * 100)}%
							</p>
						</div>
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
