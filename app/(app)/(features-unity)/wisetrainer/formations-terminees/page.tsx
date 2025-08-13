"use client";

import { BuildsTable } from "@/app/(app)/(features-unity)/components/builds-table";
import { useCompletedFormationsWithDetails } from "@/app/hooks/use-completed-formations";

export default function FormationsTermineesPage() {
	const {
		data: builds,
		error,
		isLoading,
		totalCompleted,
	} = useCompletedFormationsWithDetails("wisetrainer");

	return (
		<div className="h-full flex flex-col">
			<BuildsTable
				builds={builds}
				isLoading={isLoading}
				error={error}
				title="Formations Terminées"
				description={`Consultez l'historique de vos formations terminées (${totalCompleted} formation${
					totalCompleted > 1 ? "s" : ""
				}) et relancez-les si nécessaire`}
				mode="completed"
			/>
		</div>
	);
}
