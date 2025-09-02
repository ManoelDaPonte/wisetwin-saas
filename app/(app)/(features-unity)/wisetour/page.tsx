"use client";

import { BuildsTable } from "@/app/(app)/(features-unity)/components/builds-table";
import { useBuilds } from "@/app/hooks/use-builds";
import { useTranslations } from "@/hooks/use-translations";

export default function WisetourPage() {
	const t = useTranslations();
	const {
		data: builds,
		error,
		isLoading,
	} = useBuilds("wisetour");

	return (
		<div className="h-full flex flex-col">
			<BuildsTable
				builds={builds}
				isLoading={isLoading}
				error={error}
				title={t.wisetour.title}
				description={t.wisetour.subtitle}
				mode="catalog"
			/>
		</div>
	);
}
