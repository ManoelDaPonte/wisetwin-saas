"use client";

import { use } from "react";
import { Unity3DViewer } from "../../components/unity-3d-viewer";

interface WiseTourBuildPageProps {
  params: Promise<{
    buildId: string;
  }>;
}

export default function WiseTourBuildPage({ params }: WiseTourBuildPageProps) {
  const { buildId } = use(params);
  return <Unity3DViewer buildId={buildId} />;
}
