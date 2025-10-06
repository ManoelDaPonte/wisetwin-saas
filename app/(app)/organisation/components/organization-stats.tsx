"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, CheckCircle, Clock } from "lucide-react";
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
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Membres
					</CardTitle>
					<Users className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					{isMembersLoading ? (
						<Skeleton className="h-8 w-16" />
					) : (
						<div className="text-2xl font-bold">
							{memberCount}
						</div>
					)}
					<p className="text-xs text-muted-foreground">
						Utilisateurs
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Formations
					</CardTitle>
					<Building2 className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					{isWisetrainerLoading ? (
						<Skeleton className="h-8 w-16" />
					) : (
						<div className="text-2xl font-bold">
							{wisetrainerCount}
						</div>
					)}
					<p className="text-xs text-muted-foreground">
						Disponibles
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Complétées
					</CardTitle>
					<CheckCircle className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					{isStatsLoading ? (
						<Skeleton className="h-8 w-16" />
					) : (
						<div className="text-2xl font-bold">
							{totalFormationsCompleted}
						</div>
					)}
					<p className="text-xs text-muted-foreground">
						Total terminées
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Temps total
					</CardTitle>
					<Clock className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					{isStatsLoading ? (
						<Skeleton className="h-8 w-16" />
					) : (
						<div className="text-2xl font-bold">
							{totalTimeSpent.toFixed(0)}h
						</div>
					)}
					<p className="text-xs text-muted-foreground">
						De formation
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
