"use client";

import { BuildsTable } from "@/app/(app)/(features-unity)/components/builds-table";
import { useBuilds } from "@/app/hooks/use-builds";

export default function WisetourPage() {
	const {
		data: builds,
		error,
		isLoading,
		followBuild,
		unfollowBuild,
		isFollowLoading,
		isUnfollowLoading,
	} = useBuilds("wisetour");

	return (
		<div className="h-full flex flex-col">
			<BuildsTable
				builds={builds}
				isLoading={isLoading}
				error={error}
				title="Visites disponibles"
				description="Explorez et lancez les visites d'environnements industriels Unity"
				mode="catalog"
			/>
		</div>
	);
}
