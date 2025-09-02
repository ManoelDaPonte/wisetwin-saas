"use client";

import { useState } from "react";
import { useOrganizationStore } from "@/stores/organization-store";
import { useTranslations } from "@/hooks/use-translations";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Tags, BookOpen, BarChart3 } from "lucide-react";
import { TagsManager } from "./components/tags-manager";
import { MemberTagsManager } from "./components/member-tags-manager";
import { BuildsManager } from "./components/builds-manager";
import { ProgressDashboard } from "./components/progress-dashboard";

export default function GestionFormationsPage() {
	const t = useTranslations();
	const { activeOrganization } = useOrganizationStore();
	const [activeTab, setActiveTab] = useState("dashboard");

	// Vérification des permissions (OWNER/ADMIN seulement)
	if (!activeOrganization) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<Card>
					<CardContent className="p-6">
						<p className="text-center text-muted-foreground">
							{t.trainingPlan.selectOrganization}
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (activeOrganization.role === "MEMBER") {
		return (
			<div className="flex flex-1 items-center justify-center">
				<Card>
					<CardContent className="p-6">
						<div className="text-center">
							<h3 className="text-lg font-medium mb-2">
								{t.trainingPlan.restrictedAccess.title}
							</h3>
							<p className="text-muted-foreground">
								{t.trainingPlan.restrictedAccess.message}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						{t.trainingPlan.title}
					</h1>
					<p className="text-muted-foreground">
						{t.trainingPlan.subtitle}
					</p>
				</div>
			</div>

			{/* Navigation par onglets */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex-1"
			>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger
						value="dashboard"
						className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 transition-colors"
					>
						<BarChart3 className="w-4 h-4" />
						<span className="hidden sm:inline">
							{t.trainingPlan.tabs.dashboard}
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="tags"
						className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 transition-colors relative"
					>
						<div className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-bold mr-1">
							1
						</div>
						<span className="hidden sm:inline">
							{t.trainingPlan.tabs.plans}
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="members"
						className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 transition-colors relative"
					>
						<div className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-bold mr-1">
							2
						</div>
						<span className="hidden sm:inline">
							{t.trainingPlan.tabs.members}
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="formations"
						className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 transition-colors relative"
					>
						<div className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-bold mr-1">
							3
						</div>
						<span className="hidden sm:inline">
							{t.trainingPlan.tabs.trainings}
						</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="dashboard" className="flex-1 mt-6">
					<ProgressDashboard organizationId={activeOrganization.id} />
				</TabsContent>

				<TabsContent value="tags" className="flex-1 mt-6">
					<TagsManager organizationId={activeOrganization.id} />
				</TabsContent>

				<TabsContent value="members" className="flex-1 mt-6">
					<MemberTagsManager organizationId={activeOrganization.id} />
				</TabsContent>

				<TabsContent value="formations" className="flex-1 mt-6">
					<BuildsManager organizationId={activeOrganization.id} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
