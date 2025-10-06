"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStats } from "@/app/hooks/use-user-stats";
import { useCompletedFormationsWithDetails } from "@/app/hooks/use-completed-formations";
import { useRecentActivityWithDetails } from "@/app/hooks/use-recent-activity-with-details";
import { useSession } from "next-auth/react";
import { useTranslations } from "@/hooks/use-translations";
import {
	useIsPersonalSpace,
	useOrganizationStore,
} from "@/stores/organization-store";
import { Calendar, CheckCircle2, Clock, Trophy, Award, ArrowRight } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Build } from "@/types";

export default function DashboardPage() {
	const t = useTranslations();
	const { data: session } = useSession();
	const {} = useOrganizationStore();
	const {} = useIsPersonalSpace();
	const {
		stats,
		isLoading: isStatsLoading,
		error: statsError,
	} = useUserStats();

	const {
		activities: recentActivitiesWithDetails,
		isLoading: isActivitiesLoading,
	} = useRecentActivityWithDetails();

	const {
		data: certificationsData,
		isLoading: isCertificationsLoading,
	} = useCompletedFormationsWithDetails("wisetrainer");

	if (!session) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardContent className="pt-6">
						<p className="text-center text-muted-foreground">
							{t.dashboard.noSession}
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Métriques principales */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircle2 className="h-5 w-5" />
							Formations terminées
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isStatsLoading ? (
							<Skeleton className="h-8 w-16" />
						) : (
							<div className="text-center">
								<div className="text-3xl font-bold text-primary mb-2">
									{stats?.totalFormationsCompleted || 0}
								</div>
								<p className="text-sm text-muted-foreground">
									formations complétées
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Clock className="h-5 w-5" />
							Temps total
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isStatsLoading ? (
							<Skeleton className="h-8 w-16" />
						) : (
							<div className="text-center">
								<div className="text-3xl font-bold text-primary mb-2">
									{stats?.totalTimeSpent ? `${stats.totalTimeSpent.toFixed(1)}h` : '0h'}
								</div>
								<p className="text-sm text-muted-foreground">
									de formation
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Trophy className="h-5 w-5" />
							Moyenne des scores
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isStatsLoading ? (
							<Skeleton className="h-8 w-16" />
						) : (
							<div className="text-center">
								<div className="text-3xl font-bold text-primary mb-2">
									{stats?.averageScore ? `${stats.averageScore.toFixed(0)}%` : '0%'}
								</div>
								<p className="text-sm text-muted-foreground">
									taux de réussite
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Activité récente */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							{t.dashboard.recentActivity.title}
						</CardTitle>
						{recentActivitiesWithDetails && recentActivitiesWithDetails.length > 0 && (
							<Button variant="ghost" size="sm" asChild>
								<a href="/tableau-de-bord/activite-recente">
									Voir tout
									<ArrowRight className="h-4 w-4 ml-2" />
								</a>
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{isActivitiesLoading ? (
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-16 w-full" />
							))}
						</div>
					) : recentActivitiesWithDetails &&
					  recentActivitiesWithDetails.length > 0 ? (
						<div className="space-y-4">
							{recentActivitiesWithDetails
								.slice(0, 3)
								.map((activity) => (
									<div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg">
										<div className="p-2 rounded-full bg-green-100 text-green-600">
											<CheckCircle2 className="h-4 w-4" />
										</div>
										<div className="flex-1">
											<p className="text-sm">
												{t.dashboard.recentActivity.you} {t.dashboard.recentActivity.completed}{" "}
												<span className="font-medium">{activity.displayName}</span>
											</p>
											<div className="flex items-center gap-2 mt-1">
												<Badge variant="outline" className="text-xs">
													{activity.buildType === "wisetrainer"
														? t.dashboard.recentActivity.training
														: t.dashboard.recentActivity.visit}
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
								))}
						</div>
					) : (
						<div className="text-center py-8">
							<Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-muted-foreground">
								{t.dashboard.recentActivity.noActivity}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Dernières certifications */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Award className="h-5 w-5" />
							Dernières certifications
						</CardTitle>
						{certificationsData?.builds && certificationsData.builds.length > 0 && (
							<Button variant="ghost" size="sm" asChild>
								<a href="/tableau-de-bord/certifications">
									Voir tout
									<ArrowRight className="h-4 w-4 ml-2" />
								</a>
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{isCertificationsLoading ? (
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-16 w-full" />
							))}
						</div>
					) : certificationsData?.builds && certificationsData.builds.length > 0 ? (
						<div className="space-y-4">
							{certificationsData.builds.slice(0, 3).map((build: Build) => (
								<div key={build.id || build.name} className="flex items-center gap-4 p-4 border rounded-lg">
									<div className="p-2 rounded-full bg-blue-100 text-blue-600">
										<Award className="h-4 w-4" />
									</div>
									<div className="flex-1">
										<p className="text-sm font-medium">
											{build.metadata?.title && typeof build.metadata.title === "string"
												? build.metadata.title
												: build.name}
										</p>
										<p className="text-xs text-muted-foreground">
											{build.completion?.completedAt && format(new Date(build.completion.completedAt), "d MMMM yyyy", { locale: fr })}
										</p>
									</div>
									<Badge variant="secondary" className="bg-green-100 text-green-800">
										Terminée
									</Badge>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-muted-foreground">
								Aucune certification disponible
							</p>
							<p className="text-sm text-muted-foreground mt-1">
								Complétez des formations pour obtenir des certifications
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
							{t.dashboard.recentActivity.errorLoading}
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
