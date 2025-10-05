"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Calendar,
	Search,
	ChevronDown,
	ChevronUp,
	ArrowUpDown,
	Play,
} from "lucide-react";
import { useRecentActivityWithDetails } from "@/app/hooks/use-recent-activity-with-details";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useContainer } from "@/app/hooks/use-container";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type SortField = "buildName" | "timestamp" | "buildType" | "progress";
type SortDirection = "asc" | "desc";

interface SortState {
	field: SortField;
	direction: SortDirection;
}

export default function ActivityPage() {
	const router = useRouter();
	const { data: session } = useSession();
	const { containerId } = useContainer();
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(10);
	const [sortState, setSortState] = useState<SortState>({
		field: "timestamp",
		direction: "desc", // Plus récent d'abord
	});

	const {
		activities,
		isLoading,
		error,
	} = useRecentActivityWithDetails();

	const filteredAndSortedActivities = useMemo(() => {
		if (!activities) return [];

		const filtered = activities.filter((activity) =>
			activity.displayName.toLowerCase().includes(searchTerm.toLowerCase())
		);

		// Tri
		filtered.sort((a, b) => {
			let comparison = 0;

			switch (sortState.field) {
				case "buildName":
					comparison = a.displayName.localeCompare(b.displayName);
					break;
				case "buildType":
					comparison = a.buildType.localeCompare(b.buildType);
					break;
				case "timestamp":
					const dateA = new Date(a.timestamp).getTime();
					const dateB = new Date(b.timestamp).getTime();
					comparison = dateA - dateB;
					break;
			}

			return sortState.direction === "asc" ? comparison : -comparison;
		});

		return filtered;
	}, [activities, searchTerm, sortState]);

	const paginatedActivities = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredAndSortedActivities.slice(
			startIndex,
			startIndex + itemsPerPage
		);
	}, [filteredAndSortedActivities, currentPage, itemsPerPage]);

	const totalPages = Math.ceil(
		filteredAndSortedActivities.length / itemsPerPage
	);

	const handleSort = (field: SortField) => {
		setSortState((prev) => ({
			field,
			direction:
				prev.field === field && prev.direction === "asc"
					? "desc"
					: "asc",
		}));
	};

	const handleLaunchFormation = (activity: typeof activities[0]) => {
		const buildId = encodeURIComponent(activity.buildName);
		router.push(`/${activity.buildType}/${containerId}/${buildId}`);
	};

	const SortButton = ({
		field,
		children,
	}: {
		field: SortField;
		children: React.ReactNode;
	}) => (
		<Button
			variant="ghost"
			size="sm"
			className="h-8 data-[state=open]:bg-accent"
			onClick={() => handleSort(field)}
		>
			{children}
			{sortState.field === field ? (
				sortState.direction === "asc" ? (
					<ChevronUp className="ml-2 h-4 w-4" />
				) : (
					<ChevronDown className="ml-2 h-4 w-4" />
				)
			) : (
				<ArrowUpDown className="ml-2 h-4 w-4" />
			)}
		</Button>
	);

	if (!session) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardContent className="pt-6">
						<p className="text-center text-muted-foreground">
							Veuillez vous connecter
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-8">
				<Alert variant="destructive">
					<AlertDescription>
						Erreur lors du chargement de l&apos;activité: {error.message}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<Card className="flex flex-col h-full">
			<CardHeader className="flex-shrink-0">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							Activité récente
						</CardTitle>
						<CardDescription>
							Historique complet de vos formations
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Rechercher une formation..."
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									setCurrentPage(1);
								}}
								className="pl-8 w-64"
							/>
						</div>
					</div>
				</div>
				{!isLoading && filteredAndSortedActivities.length > 0 && (
					<div className="text-sm text-muted-foreground">
						{filteredAndSortedActivities.length} activité
						{filteredAndSortedActivities.length > 1 ? "s" : ""} trouvée
						{filteredAndSortedActivities.length > 1 ? "s" : ""}
					</div>
				)}
			</CardHeader>
			<CardContent className="flex-1 flex flex-col min-h-0">
				{isLoading ? (
					<div className="space-y-4 flex-1">
						{[...Array(5)].map((_, i) => (
							<div
								key={i}
								className="flex items-center space-x-4"
							>
								<Skeleton className="h-12 w-12 rounded-md" />
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-[250px]" />
									<Skeleton className="h-4 w-[200px]" />
								</div>
								<Skeleton className="h-8 w-[100px]" />
							</div>
						))}
					</div>
				) : filteredAndSortedActivities.length > 0 ? (
					<div className="flex flex-col flex-1 min-h-0">
						<div className="flex-1 overflow-auto">
							<Table>
								<TableHeader className="sticky top-0 bg-background z-10">
									<TableRow>
										<TableHead>
											<SortButton field="buildName">
												Formation
											</SortButton>
										</TableHead>
										<TableHead>
											<SortButton field="buildType">
												Type
											</SortButton>
										</TableHead>
										<TableHead>
											<SortButton field="timestamp">
												Date
											</SortButton>
										</TableHead>
										<TableHead className="w-32">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{paginatedActivities.map((activity) => (
										<TableRow key={activity.id}>
											<TableCell>
												<div className="font-medium">
													{activity.displayName}
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													{activity.buildType === "wisetrainer"
														? "Formation"
														: "Visite"}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="text-sm">
														{format(
															new Date(activity.timestamp),
															"d MMMM yyyy 'à' HH:mm",
															{ locale: fr }
														)}
													</div>
													<div className="text-xs text-muted-foreground">
														{formatDistanceToNow(
															new Date(activity.timestamp),
															{
																addSuffix: true,
																locale: fr,
															}
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleLaunchFormation(activity)}
													className="flex items-center gap-2"
												>
													<Play className="h-4 w-4" />
													Relancer
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex items-center justify-between space-x-2 py-4 flex-shrink-0 border-t">
								<div className="text-sm text-muted-foreground">
									Page {currentPage} sur {totalPages} (
									{filteredAndSortedActivities.length} activité
									{filteredAndSortedActivities.length > 1
										? "s"
										: ""}
									)
								</div>
								<div className="flex items-center space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											setCurrentPage((prev) =>
												Math.max(1, prev - 1)
											)
										}
										disabled={currentPage === 1}
									>
										Précédent
									</Button>
									<div className="flex items-center space-x-1">
										{Array.from(
											{
												length: Math.min(5, totalPages),
											},
											(_, i) => {
												let pageNum;
												if (totalPages <= 5) {
													pageNum = i + 1;
												} else if (currentPage <= 3) {
													pageNum = i + 1;
												} else if (
													currentPage >=
													totalPages - 2
												) {
													pageNum =
														totalPages - 4 + i;
												} else {
													pageNum =
														currentPage - 2 + i;
												}

												return (
													<Button
														key={pageNum}
														variant={
															currentPage ===
															pageNum
																? "default"
																: "outline"
														}
														size="sm"
														onClick={() =>
															setCurrentPage(
																pageNum
															)
														}
														className="w-8 h-8 p-0"
													>
														{pageNum}
													</Button>
												);
											}
										)}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											setCurrentPage((prev) =>
												Math.min(totalPages, prev + 1)
											)
										}
										disabled={currentPage === totalPages}
									>
										Suivant
									</Button>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="text-center py-8 text-muted-foreground flex-1 flex flex-col justify-center">
						<Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>
							{searchTerm
								? `Aucune activité trouvée pour "${searchTerm}"`
								: "Aucune activité trouvée"}
						</p>
						{!searchTerm && (
							<p className="text-sm mt-1">
								Commencez des formations pour voir votre activité ici
							</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
