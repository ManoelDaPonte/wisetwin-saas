"use client";

import { useState } from "react";
import { useOrganizationStore } from "@/stores/organization-store";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Users,
	Tags,
	BookOpen,
	BarChart3,
} from "lucide-react";
import { TagsManager } from "./components/tags-manager";
import { MemberTagsManager } from "./components/member-tags-manager";
import { BuildsManager } from "./components/builds-manager";
import { ProgressDashboard } from "./components/progress-dashboard";

export default function GestionFormationsPage() {
	const { activeOrganization } = useOrganizationStore();
	const [activeTab, setActiveTab] = useState("dashboard");

	// Vérification des permissions (OWNER/ADMIN seulement)
	if (!activeOrganization) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<Card>
					<CardContent className="p-6">
						<p className="text-center text-muted-foreground">
							Veuillez sélectionner une organisation pour accéder
							à la gestion des formations.
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
								Accès restreint
							</h3>
							<p className="text-muted-foreground">
								Seuls les administrateurs et propriétaires
								peuvent gérer les formations.
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
						Gestion des plans de formations
					</h1>
					<p className="text-muted-foreground">
						Gérez les formations de vos collaborateurs
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
						className="flex items-center gap-2"
					>
						<BarChart3 className="w-4 h-4" />
						<span className="hidden sm:inline">Dashboard</span>
					</TabsTrigger>
					<TabsTrigger
						value="tags"
						className="flex items-center gap-2"
					>
						<Tags className="w-4 h-4" />
						<span className="hidden sm:inline">Plans</span>
					</TabsTrigger>
					<TabsTrigger
						value="members"
						className="flex items-center gap-2"
					>
						<Users className="w-4 h-4" />
						<span className="hidden sm:inline">Membres</span>
					</TabsTrigger>
					<TabsTrigger
						value="formations"
						className="flex items-center gap-2"
					>
						<BookOpen className="w-4 h-4" />
						<span className="hidden sm:inline">Formations</span>
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
