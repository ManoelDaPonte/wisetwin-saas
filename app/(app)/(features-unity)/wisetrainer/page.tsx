"use client";

import { BuildsTable } from "@/app/(app)/(features-unity)/components/builds-table";
import { useBuilds } from "@/app/hooks/use-builds";
import { useTranslations } from "@/hooks/use-translations";

export default function WisetrainerPage() {
	const t = useTranslations();
	const {
		data: builds,
		error,
		isLoading,
	} = useBuilds("wisetrainer");

	return (
		<div className="h-full flex flex-col">
			<BuildsTable
				builds={builds}
				isLoading={isLoading}
				error={error}
				title={t.wisetrainer.title}
				description={t.wisetrainer.subtitle}
				mode="catalog"
			/>
		</div>
	);
}
