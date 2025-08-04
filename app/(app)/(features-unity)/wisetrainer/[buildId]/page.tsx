"use client";

import { use } from "react";
import { Unity3DViewer } from "../../components/unity-3d-viewer";

interface WiseTrainerBuildPageProps {
  params: Promise<{
    buildId: string;
  }>;
}

export default function WiseTrainerBuildPage({ params }: WiseTrainerBuildPageProps) {
  const { buildId } = use(params);
  return (
    <div className="h-full w-full -mb-4">
      <Unity3DViewer buildId={buildId} />
    </div>
  );
}