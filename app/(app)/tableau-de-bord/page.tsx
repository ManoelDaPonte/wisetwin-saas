"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStats } from "@/app/hooks/use-user-stats";
import { useCertifiedFormations } from "@/app/hooks/use-certified-formations";
import { useRecentActivityWithDetails } from "@/app/hooks/use-recent-activity-with-details";
import { useSession } from "next-auth/react";
import { useTranslations } from "@/hooks/use-translations";
import {
	useIsPersonalSpace,
	useOrganizationStore,
} from "@/stores/organization-store";
import { useCurrentLanguage } from "@/stores/language-store";
import { Calendar, CheckCircle2, Clock, Trophy, Award, ArrowRight } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";

export default function DashboardPage() {
	const t = useTranslations();
	const { data: session } = useSession();
	const currentLanguage = useCurrentLanguage();
	const {} = useOrganizationStore();
	const {} = useIsPersonalSpace();
	const {
		stats,
		isLoading: isStatsLoading,
		error: statsError,
	} = useUserStats();

	// Helper pour extraire le texte localisé des métadonnées
	const getLocalizedText = (text: string | { en: string; fr: string } | undefined): string | undefined => {
		if (!text) return undefined;
		if (typeof text === "string") return text;
		return text[currentLanguage] || text.fr || text.en;
	};

	const {
		activities: recentActivitiesWithDetails,
		isLoading: isActivitiesLoading,
	} = useRecentActivityWithDetails();

	const {
		certifications,
		isLoading: isCertificationsLoading,
	} = useCertifiedFormations();

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
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight">
					{t.navigation.myDashboard}
				</h1>
				<p className="text-muted-foreground">
					Vue d'ensemble de vos performances et activités récentes
				</p>
			</div>

			{/* Métriques principales */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="overflow-hidden p-0">
					{isStatsLoading ? (
						<Skeleton className="h-28 w-full" />
					) : (
						<div className="flex h-full min-h-28">
							<div className="flex items-center justify-center bg-primary w-20 flex-shrink-0">
								<CheckCircle2 className="h-8 w-8 text-primary-foreground" />
							</div>
							<div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
								<div className="text-3xl font-bold text-primary">
									{stats?.totalFormationsCompleted || 0}
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									formations terminées
								</p>
							</div>
						</div>
					)}
				</Card>

				<Card className="overflow-hidden p-0">
					{isStatsLoading ? (
						<Skeleton className="h-28 w-full" />
					) : (
						<div className="flex h-full min-h-28">
							<div className="flex items-center justify-center bg-primary w-20 flex-shrink-0">
								<Clock className="h-8 w-8 text-primary-foreground" />
							</div>
							<div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
								<div className="text-3xl font-bold text-primary">
									{stats?.totalTimeSpent ? `${stats.totalTimeSpent.toFixed(1)}h` : '0h'}
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									de formation
								</p>
							</div>
						</div>
					)}
				</Card>

				<Card className="overflow-hidden p-0">
					{isStatsLoading ? (
						<Skeleton className="h-28 w-full" />
					) : (
						<div className="flex h-full min-h-28">
							<div className="flex items-center justify-center bg-primary w-20 flex-shrink-0">
								<Trophy className="h-8 w-8 text-primary-foreground" />
							</div>
							<div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
								<div className="text-3xl font-bold text-primary">
									{stats?.averageScore ? `${stats.averageScore.toFixed(0)}%` : '0%'}
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									moyenne des scores
								</p>
							</div>
						</div>
					)}
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
										<div className="p-2 rounded-full bg-muted">
											<CheckCircle2 className="h-4 w-4" />
										</div>
										<div className="flex-1">
											<p className="text-sm">
												{t.dashboard.recentActivity.you} {t.dashboard.recentActivity.completed}{" "}
												<span className="font-medium">{activity.displayName}</span>
											</p>
											<p className="text-xs text-muted-foreground mt-1">
												{formatDistanceToNow(new Date(activity.timestamp), {
													addSuffix: true,
													locale: fr,
												})}
											</p>
										</div>
										{activity.score !== undefined && (
											<div className="text-right">
												{activity.score >= 80 && (
													<Trophy className="h-4 w-4 text-yellow-500 inline-block mr-1" />
												)}
												<span className={`font-medium ${
													activity.score >= 80
														? "text-green-600 dark:text-green-400"
														: activity.score >= 60
															? "text-yellow-600 dark:text-yellow-400"
															: "text-red-600 dark:text-red-400"
												}`}>
													{Math.round(activity.score)}%
												</span>
											</div>
										)}
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
						{certifications && certifications.length > 0 && (
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
					) : certifications && certifications.length > 0 ? (
						<div className="space-y-4">
							{certifications.slice(0, 3).map((cert) => (
								<div key={cert.build.id || cert.build.name} className="flex items-center gap-4 p-4 border rounded-lg">
									<div className="p-2 rounded-full bg-muted">
										<Award className="h-4 w-4" />
									</div>
									<div className="flex-1">
										<p className="text-sm font-medium">
											{getLocalizedText(cert.build.metadata?.title) || cert.build.name}
										</p>
										<p className="text-xs text-muted-foreground">
											{format(new Date(cert.completedAt), "d MMMM yyyy", { locale: fr })}
										</p>
									</div>
									<div className="text-right">
										<Trophy className="h-4 w-4 text-yellow-500 inline-block mr-1" />
										<span className="font-medium text-green-600 dark:text-green-400">
											{Math.round(cert.score)}%
										</span>
									</div>
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
