import { Unity3DViewer } from "@/app/(app)/(features-unity)/components/unity-3d-viewer";
import { getBuildSasUrls } from "@/lib/azure";

// Les props incluent maintenant les paramètres pour l'organisation et le build
interface WisetourBuildPageProps {
	params: {
		containerId: string; // ou organizationId
		buildId: string;
	};
}

export default async function WiseTrainerBuildPage({
	params,
}: WisetourBuildPageProps) {
	const resolvedParams = await params;
	const { containerId, buildId } = resolvedParams;

	const buildUrls = await getBuildSasUrls(containerId, buildId, "wisetour");

	return (
		<div className="h-full w-full -mb-4">
			<Unity3DViewer buildUrls={buildUrls} />
		</div>
	);
}
