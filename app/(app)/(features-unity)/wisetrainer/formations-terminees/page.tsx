"use client";

import { BuildsTable } from "@/app/(app)/(features-unity)/components/builds-table";
import { useCompletedFormationsWithDetails } from "@/app/hooks/use-completed-formations";
import { useTranslations } from "@/hooks/use-translations";

export default function FormationsTermineesPage() {
	const t = useTranslations();
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
				title={t.completedTrainings.title}
				description={t.completedTrainings.subtitle
					.replace("{count}", totalCompleted.toString())
					.replace("{s}", totalCompleted > 1 ? "s" : "")}
				mode="completed"
			/>
		</div>
	);
}
