"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOrganizationStore } from "@/stores/organization-store";
import {
	Users,
	BookOpen,
	Award,
	TrendingUp,
	Clock,
	CheckCircle2,
	Circle,
	ArrowRight,
} from "lucide-react";

// TODO: Remplacer par de vraies données depuis l'API
const mockTrainingData = {
	stats: {
		totalUsers: 0,
		activeTrainings: 0,
		completionRate: 0,
		averageTime: "0h 0min",
	},
	trainings: [] as Array<{
		id: number;
		name: string;
		totalUsers: number;
		completedUsers: number;
		averageProgress: number;
		status: string;
	}>,
	recentProgress: [] as Array<{
		userId: number;
		userName: string;
		userEmail: string;
		training: string;
		progress: number;
		lastActivity: string;
		avatar: string | null;
	}>,
};

export default function OrganizationDashboardPage() {
	const { activeOrganization } = useOrganizationStore();

	if (!activeOrganization) {
		return null;
	}

	return (
		<div className="container mx-auto py-8 space-y-8">
			<div>
				<h1 className="text-3xl font-bold">
					Tableau de bord des formations
				</h1>
				<p className="text-muted-foreground">
					Suivez l'avancement des formations de vos équipes
				</p>
			</div>

			{/* Statistiques globales */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Utilisateurs actifs
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{mockTrainingData.stats.totalUsers}
						</div>
						<p className="text-xs text-muted-foreground">
							Aucune donnée disponible
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Formations actives
						</CardTitle>
						<BookOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{mockTrainingData.stats.activeTrainings}
						</div>
						<p className="text-xs text-muted-foreground">
							Aucune formation active
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Taux de complétion
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{mockTrainingData.stats.completionRate}%
						</div>
						<Progress
							value={mockTrainingData.stats.completionRate}
							className="mt-2"
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Temps moyen
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{mockTrainingData.stats.averageTime}
						</div>
						<p className="text-xs text-muted-foreground">
							Par formation
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Vue d'ensemble des formations */}
			<Card>
				<CardHeader>
					<CardTitle>Formations en cours</CardTitle>
					<CardDescription>
						Progression globale par formation
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{mockTrainingData.trainings.map((training) => (
							<div key={training.id} className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<h4 className="font-medium">
											{training.name}
										</h4>
										{training.status === "completed" ? (
											<Badge
												variant="secondary"
												className="text-green-600"
											>
												<CheckCircle2 className="h-3 w-3 mr-1" />
												Terminée
											</Badge>
										) : (
											<Badge variant="outline">
												<Circle className="h-3 w-3 mr-1" />
												En cours
											</Badge>
										)}
									</div>
									<div className="text-sm text-muted-foreground">
										{training.completedUsers}/
										{training.totalUsers} utilisateurs
									</div>
								</div>
								<Progress
									value={training.averageProgress}
									className="h-2"
								/>
								<p className="text-xs text-muted-foreground">
									Progression moyenne:{" "}
									{training.averageProgress}%
								</p>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Activité récente */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Activité récente</CardTitle>
							<CardDescription>
								Dernières progressions des utilisateurs
							</CardDescription>
						</div>
						<Button variant="outline" size="sm">
							<Award className="h-4 w-4 mr-2" />
							Assigner des formations
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{mockTrainingData.recentProgress.map((activity) => (
							<div
								key={activity.userId}
								className="flex items-center justify-between p-4 border rounded-lg"
							>
								<div className="flex items-center gap-4">
									<Avatar>
										<AvatarImage
											src={activity.avatar || undefined}
										/>
										<AvatarFallback>
											{activity.userName
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium">
											{activity.userName}
										</p>
										<p className="text-sm text-muted-foreground">
											{activity.training}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-4">
									<div className="text-right">
										<div className="flex items-center gap-2">
											<Progress
												value={activity.progress}
												className="w-24 h-2"
											/>
											<span className="text-sm font-medium">
												{activity.progress}%
											</span>
										</div>
										<p className="text-xs text-muted-foreground mt-1">
											{activity.lastActivity}
										</p>
									</div>
									<Button variant="ghost" size="sm">
										<ArrowRight className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
