"use client";

import { ReactNode, useState, useMemo } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";

export interface AdminTableColumn<T = Record<string, unknown>> {
	key: string;
	label: string;
	render?: (item: T) => ReactNode;
	sortable?: boolean;
	searchable?: boolean;
}

export interface AdminTableAction<T = Record<string, unknown>> {
	label: string;
	icon?: ReactNode;
	onClick: (item: T) => void;
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
}

interface AdminTableProps<T = Record<string, unknown>> {
	data: T[];
	columns: AdminTableColumn<T>[];
	actions?: AdminTableAction<T>[];
	isLoading?: boolean;
	error?: Error | null;
	title: string;
	description?: string;
	searchPlaceholder?: string;
	itemsPerPage?: number;
	emptyMessage?: string;
}

type SortDirection = "asc" | "desc";

interface SortState {
	field: string;
	direction: SortDirection;
}

export function AdminTable<T extends Record<string, unknown>>({
	data,
	columns,
	actions = [],
	isLoading = false,
	error = null,
	title,
	description,
	searchPlaceholder = "Rechercher...",
	itemsPerPage = 10,
	emptyMessage = "Aucune donnée disponible",
}: AdminTableProps<T>) {
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortState, setSortState] = useState<SortState>({
		field: columns[0]?.key || "",
		direction: "asc",
	});

	// Filtrage et tri des données
	const filteredAndSortedData = useMemo(() => {
		let filtered = data;

		// Filtrage par recherche
		if (searchTerm) {
			filtered = data.filter((item) => {
				return columns.some((column) => {
					if (column.searchable === false) return false;

					const value = item[column.key];
					if (value === null || value === undefined) return false;

					return String(value)
						.toLowerCase()
						.includes(searchTerm.toLowerCase());
				});
			});
		}

		// Tri
		if (sortState.field) {
			filtered.sort((a, b) => {
				const aValue = a[sortState.field];
				const bValue = b[sortState.field];

				// Gestion des valeurs nulles/undefined
				if (!aValue && !bValue) return 0;
				if (!aValue) return 1;
				if (!bValue) return -1;

				let comparison = 0;

				// Tri selon le type de données
				if (typeof aValue === "string" && typeof bValue === "string") {
					comparison = aValue.localeCompare(bValue);
				} else if (aValue instanceof Date && bValue instanceof Date) {
					comparison = aValue.getTime() - bValue.getTime();
				} else {
					comparison = String(aValue).localeCompare(String(bValue));
				}

				return sortState.direction === "asc" ? comparison : -comparison;
			});
		}

		return filtered;
	}, [data, searchTerm, sortState, columns]);

	// Pagination
	const paginatedData = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredAndSortedData.slice(
			startIndex,
			startIndex + itemsPerPage
		);
	}, [filteredAndSortedData, currentPage, itemsPerPage]);

	const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

	// Fonctions de gestion
	const handleSort = (field: string) => {
		const column = columns.find((col) => col.key === field);
		if (column?.sortable === false) return;

		setSortState((prev) => ({
			field,
			direction:
				prev.field === field && prev.direction === "asc"
					? "desc"
					: "asc",
		}));
	};

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1); // Reset à la première page
	};

	// Composant pour les boutons de tri
	const SortButton = ({
		field,
		children,
	}: {
		field: string;
		children: React.ReactNode;
	}) => {
		const column = columns.find((col) => col.key === field);
		if (column?.sortable === false) {
			return <span className="font-medium">{children}</span>;
		}

		return (
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
	};

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					Erreur lors du chargement: {error.message}
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Card className="flex flex-col h-full">
			<CardHeader className="flex-shrink-0">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>{title}</CardTitle>
						{description && (
							<CardDescription>{description}</CardDescription>
						)}
					</div>
					<div className="flex items-center gap-2">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder={searchPlaceholder}
								value={searchTerm}
								onChange={(e) => {
									handleSearch(e.target.value);
								}}
								className="pl-8 w-64"
							/>
						</div>
					</div>
				</div>
				{!isLoading && filteredAndSortedData.length > 0 && (
					<div className="text-sm text-muted-foreground">
						{filteredAndSortedData.length} résultat
						{filteredAndSortedData.length > 1 ? "s" : ""} trouvé
						{filteredAndSortedData.length > 1 ? "s" : ""}
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
				) : filteredAndSortedData.length > 0 ? (
					<div className="flex flex-col flex-1 min-h-0">
						<div className="flex-1 overflow-auto">
							<Table>
								<TableHeader className="sticky top-0 bg-background z-10">
									<TableRow>
										{columns.map((column) => (
											<TableHead key={column.key}>
												<SortButton field={column.key}>
													{column.label}
												</SortButton>
											</TableHead>
										))}
										{actions.length > 0 && (
											<TableHead className="w-20">
												Actions
											</TableHead>
										)}
									</TableRow>
								</TableHeader>
								<TableBody>
									{paginatedData.map((item, index) => (
										<TableRow key={String(item.id) || index}>
											{columns.map((column) => (
												<TableCell key={column.key}>
													{column.render
														? column.render(item)
														: String(item[column.key] ?? '')}
												</TableCell>
											))}
											{actions.length > 0 && (
												<TableCell>
													<div className="flex gap-1">
														{actions.map(
															(
																action,
																actionIndex
															) => (
																<Button
																	key={
																		actionIndex
																	}
																	variant={
																		action.variant ||
																		"ghost"
																	}
																	size="sm"
																	onClick={() =>
																		action.onClick(
																			item
																		)
																	}
																	className="flex items-center gap-1"
																>
																	{
																		action.icon
																	}
																	{
																		action.label
																	}
																</Button>
															)
														)}
													</div>
												</TableCell>
											)}
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
									{filteredAndSortedData.length} résultat
									{filteredAndSortedData.length > 1
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
											{ length: Math.min(5, totalPages) },
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
						<div className="h-12 w-12 mx-auto mb-4 opacity-50 bg-muted rounded-md" />
						<p>
							{searchTerm
								? `Aucun résultat trouvé pour "${searchTerm}"`
								: emptyMessage}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
