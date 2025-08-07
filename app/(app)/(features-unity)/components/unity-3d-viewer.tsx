"use client";

import { Unity, useUnityContext } from "react-unity-webgl";

// L'interface pour la structure de nos URLs
interface BuildUrls {
	loader: string;
	framework: string;
	wasm: string;
	data: string;
}

interface Unity3DViewerProps {
	buildUrls: BuildUrls;
}

export function Unity3DViewer({ buildUrls }: Unity3DViewerProps) {
	const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
		loaderUrl: buildUrls.loader,
		dataUrl: buildUrls.data,
		frameworkUrl: buildUrls.framework,
		codeUrl: buildUrls.wasm,
	});

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
