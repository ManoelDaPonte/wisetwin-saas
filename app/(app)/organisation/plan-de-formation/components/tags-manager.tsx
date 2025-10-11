"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Search,
	MoreHorizontal,
	Edit,
	Trash2,
	Users,
	BookOpen,
	Loader2,
	AlertCircle,
} from "lucide-react";
import { useTrainingTagsManager } from "../hooks/use-training-tags";
import { TagBadge } from "./tag-badge";
import { CreateTagDialog } from "./create-tag-dialog";
import { EditTagDialog } from "./edit-tag-dialog";
import { formatDistanceToNow, format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { TrainingTag, UpdateTrainingTagData } from "@/types/training";
import { useTranslations } from "@/hooks/use-translations";
import { useCurrentLanguage } from "@/stores/language-store";

interface TagsManagerProps {
	organizationId: string;
}

export function TagsManager({}: TagsManagerProps) {
	const t = useTranslations();
	const currentLanguage = useCurrentLanguage();
	const dateLocale = currentLanguage === "fr" ? fr : enUS;
	const [search, setSearch] = useState("");
	const [tagToDelete, setTagToDelete] = useState<string | null>(null);
	const [tagToEdit, setTagToEdit] = useState<TrainingTag | null>(null);

	const {
		tags,
		isLoading,
		isError,
		error,
		createTag,
		updateTag,
		deleteTag,
		isCreating,
		isUpdating,
		isDeleting,
		createError,
		updateError,
		deleteError,
		canManage,
		canDelete,
		refetch,
	} = useTrainingTagsManager();

	// Filtrage des tags par recherche
	const filteredTags = tags.filter(
		(tag) =>
			tag.name.toLowerCase().includes(search.toLowerCase()) ||
			tag.description?.toLowerCase().includes(search.toLowerCase())
	);

	const handleDeleteTag = () => {
		if (tagToDelete) {
			deleteTag(tagToDelete, {
				onSuccess: () => {
					// Fermer la modale seulement après succès de la suppression
					setTagToDelete(null);
				},
				onError: () => {
					// La modale reste ouverte pour afficher l'erreur
				}
			});
		}
	};

	const handleEditTag = (updatedData: UpdateTrainingTagData) => {
		if (tagToEdit) {
			updateTag({ tagId: tagToEdit.id, data: updatedData }, {
				onSuccess: () => {
					// Fermer la modale seulement après succès de la mise à jour
					setTagToEdit(null);
				},
				onError: () => {
					// La modale reste ouverte pour afficher l'erreur
				}
			});
		}
	};

	if (isError) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center p-6">
					<AlertCircle className="h-12 w-12 text-destructive mb-4" />
					<h3 className="text-lg font-medium mb-2">
						{t.tagsManager.errors.loadingError}
					</h3>
					<p className="text-muted-foreground text-center mb-4">
						{error?.message || t.tagsManager.errors.cannotLoadPlans}
					</p>
					<Button onClick={() => refetch()} variant="outline">
						{t.tagsManager.errors.retry}
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{/* Tableau des plans */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-base">
								{t.tagsManager.title}
							</CardTitle>
							<CardDescription>
								{t.tagsManager.subtitle}
							</CardDescription>
						</div>
						<div className="flex gap-2">
							<div className="relative max-w-sm">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder={t.tagsManager.searchPlaceholder}
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-10"
								/>
							</div>
							{canManage && (
								<CreateTagDialog
									onCreateTag={createTag}
									isCreating={isCreating}
									createError={createError}
								/>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t.tagsManager.table.plan}</TableHead>
										<TableHead>{t.tagsManager.table.description}</TableHead>
										<TableHead className="text-center">
											{t.tagsManager.table.members}
										</TableHead>
										<TableHead className="text-center">
											{t.tagsManager.table.trainings}
										</TableHead>
										<TableHead>{t.tagsManager.table.dueDate}</TableHead>
										<TableHead>{t.tagsManager.table.priority}</TableHead>
										<TableHead>{t.tagsManager.table.created}</TableHead>
										<TableHead className="w-[100px]">
											{t.tagsManager.table.actions}
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{[...Array(4)].map((_, i) => (
										<TableRow key={i}>
											<TableCell>
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<Skeleton className="h-5 w-20 rounded-full" />
														<Skeleton className="h-4 w-32" />
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-48" />
											</TableCell>
											<TableCell className="text-center">
												<Skeleton className="h-4 w-8 mx-auto" />
											</TableCell>
											<TableCell className="text-center">
												<Skeleton className="h-4 w-8 mx-auto" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-24" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-5 w-16 rounded-full" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-20" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-8 w-8 rounded" />
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : filteredTags.length === 0 ? (
						<div className="text-center py-8">
							<div className="text-muted-foreground mb-4">
								{search
									? t.tagsManager.empty.noResults
									: t.tagsManager.empty.noPlans}
							</div>
							{canManage && !search && (
								<CreateTagDialog
									onCreateTag={createTag}
									isCreating={isCreating}
									createError={createError}
								/>
							)}
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t.tagsManager.table.plan}</TableHead>
										<TableHead>{t.tagsManager.table.description}</TableHead>
										<TableHead className="text-center">
											{t.tagsManager.table.members}
										</TableHead>
										<TableHead className="text-center">
											{t.tagsManager.table.trainings}
										</TableHead>
										<TableHead>{t.tagsManager.table.dueDate}</TableHead>
										<TableHead>{t.tagsManager.table.priority}</TableHead>
										<TableHead>{t.tagsManager.table.created}</TableHead>
										{canManage && (
											<TableHead className="w-[70px]">
												{t.tagsManager.table.actions}
											</TableHead>
										)}
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredTags.map((tag) => (
										<TableRow key={tag.id}>
											<TableCell>
												<TagBadge
													name={tag.name}
													color={tag.color}
												/>
											</TableCell>
											<TableCell>
												<div className="max-w-xs">
													{tag.description ? (
														<p className="text-sm text-muted-foreground truncate">
															{tag.description}
														</p>
													) : (
														<span className="text-sm text-muted-foreground italic">
															{t.tagsManager.table.noDescription}
														</span>
													)}
												</div>
											</TableCell>
											<TableCell className="text-center">
												<div className="flex items-center justify-center gap-1">
													<Users className="h-4 w-4 text-muted-foreground" />
													<span className="font-medium">
														{tag._count
															?.memberTags || 0}
													</span>
												</div>
											</TableCell>
											<TableCell className="text-center">
												<div className="flex items-center justify-center gap-1">
													<BookOpen className="h-4 w-4 text-muted-foreground" />
													<span className="font-medium">
														{tag._count
															?.buildTags || 0}
													</span>
												</div>
											</TableCell>
											<TableCell>
												{tag.dueDate ? (
													<div className="text-sm">
														<span
															className={`${
																new Date(
																	tag.dueDate
																) < new Date()
																	? "text-destructive font-medium"
																	: "text-muted-foreground"
															}`}
														>
															{format(
																new Date(
																	tag.dueDate
																),
																"dd/MM/yyyy",
																{ locale: dateLocale }
															)}
														</span>
													</div>
												) : (
													<span className="text-sm text-muted-foreground italic">
														{t.tagsManager.table.noDueDate}
													</span>
												)}
											</TableCell>
											<TableCell>
												<Badge
													variant={
														tag.priority === "HIGH"
															? "destructive"
															: tag.priority ===
															  "MEDIUM"
															? "default"
															: "secondary"
													}
													className="text-xs"
												>
													{tag.priority === "HIGH"
														? t.tagsManager.priorities.high
														: tag.priority ===
														  "MEDIUM"
														? t.tagsManager.priorities.medium
														: t.tagsManager.priorities.low}
												</Badge>
											</TableCell>
											<TableCell>
												<span className="text-sm text-muted-foreground">
													{formatDistanceToNow(
														new Date(tag.createdAt),
														{
															addSuffix: true,
															locale: dateLocale,
														}
													)}
												</span>
											</TableCell>
											{canManage && (
												<TableCell>
													<DropdownMenu>
														<DropdownMenuTrigger
															asChild
														>
															<Button
																variant="ghost"
																className="h-8 w-8 p-0"
															>
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem
																onClick={() =>
																	setTagToEdit(
																		tag
																	)
																}
															>
																<Edit className="mr-2 h-4 w-4" />
																{t.tagsManager.actions.edit}
															</DropdownMenuItem>
															{canDelete && (
																<>
																	<DropdownMenuSeparator />
																	<DropdownMenuItem
																		className="text-destructive"
																		onClick={() =>
																			setTagToDelete(
																				tag.id
																			)
																		}
																	>
																		<Trash2 className="mr-2 h-4 w-4" />
																		{t.tagsManager.actions.delete}
																	</DropdownMenuItem>
																</>
															)}
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											)}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Dialog de confirmation de suppression */}
			<AlertDialog
				open={!!tagToDelete}
				onOpenChange={() => setTagToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t.tagsManager.deleteDialog.title}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t.tagsManager.deleteDialog.description}
						</AlertDialogDescription>
						<ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
							<li>{t.tagsManager.deleteDialog.consequence1}</li>
							<li>{t.tagsManager.deleteDialog.consequence2}</li>
							<li>{t.tagsManager.deleteDialog.consequence3}</li>
						</ul>
					</AlertDialogHeader>
					{deleteError && (
						<div className="text-sm text-destructive">
							{deleteError.message}
						</div>
					)}
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>
							{t.tagsManager.deleteDialog.cancel}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteTag}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting && (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							)}
							{t.tagsManager.deleteDialog.confirm}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Dialog d'édition */}
			<EditTagDialog
				tag={tagToEdit}
				onEditTag={handleEditTag}
				onClose={() => setTagToEdit(null)}
				isUpdating={isUpdating}
				updateError={updateError}
			/>
		</div>
	);
}
