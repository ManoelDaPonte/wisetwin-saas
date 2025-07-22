"use client";

import { Unity, useUnityContext } from "react-unity-webgl";
import { useContainer } from "@/app/hooks/use-container";
import { useEffect, useState } from "react";

interface Unity3DViewerProps {
  buildId: string;
}

export function Unity3DViewer({ buildId }: Unity3DViewerProps) {
  const { containerId } = useContainer();
  const [buildType, setBuildType] = useState<string>("wisetrainer");

  // Construire les URLs Azure directement
  //https://wisetwindev.blob.core.windows.net/org-wisetwin-cmd32w57/wisetrainer/LOTO_Acces_Zone_Robot.data.gz
  const baseUrl = `https://wisetwindev.blob.core.windows.net/${containerId}/${buildType}/${buildId}`;

  // Configuration Unity WebGL avec les URLs Azure
  const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: `${baseUrl}.loader.js`,
    dataUrl: `${baseUrl}.data.gz`,
    frameworkUrl: `${baseUrl}.framework.js.gz`,
    codeUrl: `${baseUrl}.wasm.gz`,
  });

  return (
    <div className="">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p>Chargement Unity: {Math.round(loadingProgression * 100)}%</p>
            <div className="w-48 h-2 bg-gray-200 rounded mt-2">
              <div
                className="h-full bg-blue-500 rounded transition-all duration-300"
                style={{ width: `${loadingProgression * 100}%` }}
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
        }}
      />
    </div>
  );
}
