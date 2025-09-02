"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface OrganizationStatsProps {
	memberCount: number;
	maxUsers: number;
	wisetourCount: number;
	wisetrainerCount: number;
	isMembersLoading: boolean;
	isWisetourLoading: boolean;
	isWisetrainerLoading: boolean;
}

export function OrganizationStats({
	memberCount,
	maxUsers,
	wisetourCount,
	wisetrainerCount,
	isMembersLoading,
	isWisetourLoading,
	isWisetrainerLoading,
}: OrganizationStatsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
							{memberCount} / {maxUsers}
						</div>
					)}
					<p className="text-xs text-muted-foreground">
						Utilisateurs (limite)
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						WiseTrainer
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
						Formations disponibles
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Wisetour
					</CardTitle>
					<Building2 className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					{isWisetourLoading ? (
						<Skeleton className="h-8 w-16" />
					) : (
						<div className="text-2xl font-bold">
							{wisetourCount}
						</div>
					)}
					<p className="text-xs text-muted-foreground">
						Environnements disponibles
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
