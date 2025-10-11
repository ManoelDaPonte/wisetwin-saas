"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/hooks/use-translations";
import { Building2, Layers, Boxes } from "lucide-react";

export function ConceptsExplainer() {
	const t = useTranslations();

	const concepts = [
		{
			id: "multitenant",
			title: t.home.concepts.multitenant.title,
			description: t.home.concepts.multitenant.description,
			icon: Building2,
			details: [
				t.home.concepts.multitenant.detail1,
				t.home.concepts.multitenant.detail2,
				t.home.concepts.multitenant.detail3
			]
		},
		{
			id: "spaces",
			title: t.home.concepts.spaces.title,
			description: t.home.concepts.spaces.description,
			icon: Layers,
			details: [
				t.home.concepts.spaces.detail1,
				t.home.concepts.spaces.detail2,
				t.home.concepts.spaces.detail3
			]
		},
		{
			id: "trainings",
			title: t.home.concepts.trainings.title,
			description: t.home.concepts.trainings.description,
			icon: Boxes,
			details: [
				t.home.concepts.trainings.detail1,
				t.home.concepts.trainings.detail2,
				t.home.concepts.trainings.detail3
			]
		}
	];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">
					{t.home.concepts.title}
				</h2>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				{concepts.map((concept) => {
					const Icon = concept.icon;

					return (
						<Card key={concept.id} className="hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 bg-primary/10 rounded-lg">
										<Icon className="h-8 w-8 text-primary" />
									</div>
								</div>
								<CardTitle>{concept.title}</CardTitle>
								<CardDescription>{concept.description}</CardDescription>
							</CardHeader>

							<CardContent>
								<ul className="space-y-2">
									{concept.details.map((detail, index) => (
										<li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
											<span className="block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
											<span>{detail}</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}