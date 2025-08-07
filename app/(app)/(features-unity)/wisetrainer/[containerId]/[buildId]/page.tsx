import { Unity3DViewer } from "@/app/(app)/(features-unity)/components/unity-3d-viewer";
import { getBuildSasUrls } from "@/lib/azure";

// Les props incluent maintenant les paramètres pour l'organisation et le build
interface WiseTrainerBuildPageProps {
	params: {
		containerId: string; // ou organizationId
		buildId: string;
	};
}

export default async function WiseTrainerBuildPage({
	params,
}: WiseTrainerBuildPageProps) {
	const resolvedParams = await params;
	const { containerId, buildId } = resolvedParams;

	// 3. OBTENIR LES URLS SAS (notre logique existante)
	const buildUrls = await getBuildSasUrls(
		containerId,
		buildId,
		"wisetrainer"
	);

	// 4. PASSER LES URLS AU COMPOSANT CLIENT
	return (
		<div className="h-full w-full -mb-4">
			<Unity3DViewer buildUrls={buildUrls} />
		</div>
	);
}
