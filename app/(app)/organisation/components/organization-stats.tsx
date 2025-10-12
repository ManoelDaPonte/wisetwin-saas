"use client";

import { Card } from "@/components/ui/card";
import { Building2, Users, CheckCircle2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface OrganizationStatsProps {
	memberCount: number;
	wisetrainerCount: number;
	totalFormationsCompleted: number;
	totalTimeSpent: number;
	isMembersLoading: boolean;
	isWisetrainerLoading: boolean;
	isStatsLoading: boolean;
}

export function OrganizationStats({
	memberCount,
	wisetrainerCount,
	totalFormationsCompleted,
	totalTimeSpent,
	isMembersLoading,
	isWisetrainerLoading,
	isStatsLoading,
}: OrganizationStatsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card className="overflow-hidden p-0">
				{isMembersLoading ? (
					<Skeleton className="h-28 w-full" />
				) : (
					<div className="flex h-full min-h-28">
						<div className="flex items-center justify-center bg-primary w-20 flex-shrink-0">
							<Users className="h-8 w-8 text-primary-foreground" />
						</div>
						<div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
							<div className="text-3xl font-bold text-primary">
								{memberCount}
							</div>
							<p className="text-sm text-muted-foreground mt-1">
								membres actifs
							</p>
						</div>
					</div>
				)}
			</Card>

			<Card className="overflow-hidden p-0">
				{isWisetrainerLoading ? (
					<Skeleton className="h-28 w-full" />
				) : (
					<div className="flex h-full min-h-28">
						<div className="flex items-center justify-center bg-primary w-20 flex-shrink-0">
							<Building2 className="h-8 w-8 text-primary-foreground" />
						</div>
						<div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
							<div className="text-3xl font-bold text-primary">
								{wisetrainerCount}
							</div>
							<p className="text-sm text-muted-foreground mt-1">
								formations disponibles
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
							<CheckCircle2 className="h-8 w-8 text-primary-foreground" />
						</div>
						<div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
							<div className="text-3xl font-bold text-primary">
								{totalFormationsCompleted}
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
								{totalTimeSpent.toFixed(0)}h
							</div>
							<p className="text-sm text-muted-foreground mt-1">
								de formation
							</p>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
}
