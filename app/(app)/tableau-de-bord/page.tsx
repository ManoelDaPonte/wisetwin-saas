"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStats } from "@/app/hooks/use-user-stats";
import { useSession } from "next-auth/react";
import {
	useIsPersonalSpace,
	useOrganizationStore,
} from "@/stores/organization-store";
import { BookOpen, Calendar, CheckCircle2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

function RecentActivityItem({
	activity,
}: {
	activity: {
		id: string;
		type: "completion";
		buildName: string;
		buildType: "wisetrainer" | "wisetour";
		timestamp: string;
	};
}) {
	const getIcon = () => CheckCircle2;
	const getActionText = () => "a terminé";

	const Icon = getIcon();

	return (
		<div className="flex items-center gap-4 p-4 border rounded-lg">
			<div className="p-2 rounded-full bg-green-100 text-green-600">
				<Icon className="h-4 w-4" />
			</div>
			<div className="flex-1">
				<p className="text-sm">
					Vous {getActionText()}{" "}
					<span className="font-medium">{activity.buildName}</span>
				</p>
				<div className="flex items-center gap-2 mt-1">
					<Badge variant="outline" className="text-xs">
						{activity.buildType === "wisetrainer"
							? "Formation"
							: "Visite"}
					</Badge>
					<p className="text-xs text-muted-foreground">
						{formatDistanceToNow(new Date(activity.timestamp), {
							addSuffix: true,
							locale: fr,
						})}
					</p>
				</div>
			</div>
		</div>
	);
}

export default function DashboardPage() {
	const { data: session } = useSession();
	const {} = useOrganizationStore();
	const {} = useIsPersonalSpace();
	const {
		stats,
		isLoading: isStatsLoading,
		error: statsError,
	} = useUserStats();

	if (!session) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardContent className="pt-6">
						<p className="text-center text-muted-foreground">
							Veuillez vous connecter pour accéder à votre tableau
							de bord.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Résumé par type */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							WiseTrainer (Formations)
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isStatsLoading ? (
							<Skeleton className="h-8 w-16" />
						) : (
							<div className="text-center">
								<div className="text-3xl font-bold text-primary mb-2">
									{stats?.wisetrainerCompletions || 0}
								</div>
								<p className="text-sm text-muted-foreground">
									Formations terminées
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Eye className="h-5 w-5" />
							Wisetour (Visites)
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isStatsLoading ? (
							<Skeleton className="h-8 w-16" />
						) : (
							<div className="text-center">
								<div className="text-3xl font-bold text-primary mb-2">
									{stats?.wisetourVisits || 0}
								</div>
								<p className="text-sm text-muted-foreground">
									Environnements visités
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Activité récente */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Activité récente
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isStatsLoading ? (
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-16 w-full" />
							))}
						</div>
					) : stats?.recentActivity &&
					  stats.recentActivity.length > 0 ? (
						<div className="space-y-4">
							{stats.recentActivity
								.slice(0, 5)
								.map((activity) => (
									<RecentActivityItem
										key={activity.id}
										activity={activity}
									/>
								))}
						</div>
					) : (
						<div className="text-center py-8">
							<Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-muted-foreground">
								Aucune activité récente. Commencez une formation
								!
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Messages d'erreur */}
			{statsError && (
				<Card className="border-destructive">
					<CardContent className="pt-6">
						<p className="text-destructive text-sm">
							Une erreur est survenue lors du chargement des
							données. Veuillez rafraîchir la page.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
