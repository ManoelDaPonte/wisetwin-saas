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
import { Checkbox } from "@/components/ui/checkbox";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus, Minus, Loader2, AlertCircle } from "lucide-react";
import { useMemberTagsManager } from "../hooks/use-member-tags";
import { TagBadge } from "./tag-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getUserInitials } from "@/lib/user-utils";

interface MemberTagsManagerProps {
	organizationId: string;
}

export function MemberTagsManager({}: MemberTagsManagerProps) {
	const [search, setSearch] = useState("");
	const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [filterByTag, setFilterByTag] = useState<string>("");
	const [showAssignDialog, setShowAssignDialog] = useState(false);
	const [showRemoveDialog, setShowRemoveDialog] = useState(false);

	const {
		members,
		tags,
		membersWithTags,
		isLoading,
		isError,
		error,
		bulkAssignTags,
		bulkRemoveTags,
		isBulkAssigning,
		isBulkRemoving,
		canManage,
		refetch,
	} = useMemberTagsManager();

	// Filtrage des membres
	const filteredMembers = membersWithTags.filter((member) => {
		const matchesSearch =
			member.name?.toLowerCase().includes(search.toLowerCase()) ||
			member.email.toLowerCase().includes(search.toLowerCase());

		const matchesTagFilter =
			!filterByTag ||
			filterByTag === "all" ||
			member.tags.some((tag) => tag.id === filterByTag);

		return matchesSearch && matchesTagFilter;
	});

	// Gestion des sélections
	const toggleMemberSelection = (memberId: string) => {
		setSelectedMembers((prev) =>
			prev.includes(memberId)
				? prev.filter((id) => id !== memberId)
				: [...prev, memberId]
		);
	};

	const toggleTagSelection = (tagId: string) => {
		setSelectedTags((prev) =>
			prev.includes(tagId)
				? prev.filter((id) => id !== tagId)
				: [...prev, tagId]
		);
	};

	// Actions
	const handleBulkAssign = () => {
		if (selectedMembers.length === 0 || selectedTags.length === 0) return;

		bulkAssignTags({
			userIds: selectedMembers,
			tagIds: selectedTags,
		});

		setShowAssignDialog(false);
		setSelectedMembers([]);
		setSelectedTags([]);
	};

	const handleBulkRemove = () => {
		if (selectedMembers.length === 0 || selectedTags.length === 0) return;

		bulkRemoveTags({
			userIds: selectedMembers,
			tagIds: selectedTags,
		});

		setShowRemoveDialog(false);
		setSelectedMembers([]);
		setSelectedTags([]);
	};

	if (isError) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center p-6">
					<AlertCircle className="h-12 w-12 text-destructive mb-4" />
					<h3 className="text-lg font-medium mb-2">
						Erreur de chargement
					</h3>
					<p className="text-muted-foreground text-center mb-4">
						{error || "Impossible de charger les données"}
					</p>
					<Button onClick={() => refetch()} variant="outline">
						Réessayer
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{/* Tableau des membres */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-base">
								Gestion des membres
							</CardTitle>
							<CardDescription>
								Assignez et gérez les plans de formation de vos
								membres
							</CardDescription>
						</div>
						<div className="flex gap-2">
							<div className="relative max-w-sm">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Rechercher un membre..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Select
								value={filterByTag}
								onValueChange={setFilterByTag}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Filtrer par plan" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										Tous les membres
									</SelectItem>
									{tags.map((tag) => (
										<SelectItem key={tag.id} value={tag.id}>
											<div className="flex items-center gap-2">
												<span
													className="w-2 h-2 rounded-full"
													style={{
														backgroundColor:
															tag.color,
													}}
												/>
												{tag.name}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{canManage && (
								<div className="flex items-center gap-2">
									<Dialog
										open={showAssignDialog}
										onOpenChange={setShowAssignDialog}
									>
										<DialogTrigger asChild>
											<Button
												size="sm"
												disabled={
													selectedMembers.length === 0
												}
											>
												<Plus className="w-4 h-4 mr-2" />
												Assigner
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>
													Assigner des plans
												</DialogTitle>
												<DialogDescription>
													Sélectionnez les plans à
													assigner aux{" "}
													{selectedMembers.length}{" "}
													membre
													{selectedMembers.length > 1
														? "s"
														: ""}{" "}
													sélectionné
													{selectedMembers.length > 1
														? "s"
														: ""}
													.
												</DialogDescription>
											</DialogHeader>

											<div className="space-y-4">
												<div className="text-sm font-medium">
													Plans disponibles :
												</div>
												<div className="max-h-48 overflow-y-auto space-y-2">
													{tags.map((tag) => (
														<div
															key={tag.id}
															className="flex items-center space-x-2"
														>
															<Checkbox
																id={`tag-${tag.id}`}
																checked={selectedTags.includes(
																	tag.id
																)}
																onCheckedChange={() =>
																	toggleTagSelection(
																		tag.id
																	)
																}
															/>
															<label
																htmlFor={`tag-${tag.id}`}
																className="flex-1 cursor-pointer"
															>
																<TagBadge
																	name={
																		tag.name
																	}
																	color={
																		tag.color
																	}
																/>
															</label>
														</div>
													))}
												</div>
											</div>

											<DialogFooter>
												<Button
													variant="outline"
													onClick={() =>
														setShowAssignDialog(
															false
														)
													}
												>
													Annuler
												</Button>
												<Button
													onClick={handleBulkAssign}
													disabled={
														selectedTags.length ===
															0 || isBulkAssigning
													}
												>
													{isBulkAssigning && (
														<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													)}
													Assigner
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>

									<Dialog
										open={showRemoveDialog}
										onOpenChange={setShowRemoveDialog}
									>
										<DialogTrigger asChild>
											<Button
												size="sm"
												variant="outline"
												disabled={
													selectedMembers.length === 0
												}
											>
												<Minus className="w-4 h-4 mr-2" />
												Retirer
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>
													Retirer des plans
												</DialogTitle>
												<DialogDescription>
													Sélectionnez les plans à
													retirer des{" "}
													{selectedMembers.length}{" "}
													membre
													{selectedMembers.length > 1
														? "s"
														: ""}{" "}
													sélectionné
													{selectedMembers.length > 1
														? "s"
														: ""}
													.
												</DialogDescription>
											</DialogHeader>

											<div className="space-y-4">
												<div className="text-sm font-medium">
													Plans à retirer :
												</div>
												<div className="max-h-48 overflow-y-auto space-y-2">
													{tags.map((tag) => (
														<div
															key={tag.id}
															className="flex items-center space-x-2"
														>
															<Checkbox
																id={`remove-tag-${tag.id}`}
																checked={selectedTags.includes(
																	tag.id
																)}
																onCheckedChange={() =>
																	toggleTagSelection(
																		tag.id
																	)
																}
															/>
															<label
																htmlFor={`remove-tag-${tag.id}`}
																className="flex-1 cursor-pointer"
															>
																<TagBadge
																	name={
																		tag.name
																	}
																	color={
																		tag.color
																	}
																/>
															</label>
														</div>
													))}
												</div>
											</div>

											<DialogFooter>
												<Button
													variant="outline"
													onClick={() =>
														setShowRemoveDialog(
															false
														)
													}
												>
													Annuler
												</Button>
												<Button
													variant="destructive"
													onClick={handleBulkRemove}
													disabled={
														selectedTags.length ===
															0 || isBulkRemoving
													}
												>
													{isBulkRemoving && (
														<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													)}
													Retirer
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								</div>
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
										<TableHead className="w-[50px]">
											<Skeleton className="h-4 w-4" />
										</TableHead>
										<TableHead>Membre</TableHead>
										<TableHead>Plans assignés</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{[...Array(5)].map((_, i) => (
										<TableRow key={i}>
											<TableCell>
												<Skeleton className="h-4 w-4" />
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-3">
													<Skeleton className="h-10 w-10 rounded-full" />
													<div className="space-y-2">
														<Skeleton className="h-4 w-[150px]" />
														<Skeleton className="h-3 w-[200px]" />
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex flex-wrap gap-1">
													<Skeleton className="h-5 w-16 rounded-full" />
													<Skeleton className="h-5 w-20 rounded-full" />
													<Skeleton className="h-5 w-12 rounded-full" />
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : filteredMembers.length === 0 ? (
						<div className="text-center py-8">
							<div className="text-muted-foreground mb-4">
								{search || filterByTag
									? "Aucun membre trouvé pour cette recherche"
									: "Aucun membre dans cette organisation"}
							</div>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										{canManage && (
											<TableHead className="w-[50px]">
												<Checkbox
													checked={
														selectedMembers.length ===
															filteredMembers.length &&
														filteredMembers.length >
															0
													}
													onCheckedChange={(
														checked
													) => {
														if (checked) {
															setSelectedMembers(
																filteredMembers.map(
																	(m) => m.id
																)
															);
														} else {
															setSelectedMembers(
																[]
															);
														}
													}}
												/>
											</TableHead>
										)}
										<TableHead>Membre</TableHead>
										<TableHead>Plans assignés</TableHead>
										<TableHead>Membre depuis</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredMembers.map((member) => (
										<TableRow key={member.id}>
											{canManage && (
												<TableCell>
													<Checkbox
														checked={selectedMembers.includes(
															member.id
														)}
														onCheckedChange={() =>
															toggleMemberSelection(
																member.id
															)
														}
													/>
												</TableCell>
											)}
											<TableCell>
												<div className="flex items-center gap-3">
													<Avatar className="h-8 w-8">
														<AvatarImage
															src={
																member.image ||
																undefined
															}
														/>
														<AvatarFallback>
															{getUserInitials(member)}
														</AvatarFallback>
													</Avatar>
													<div>
														<div className="font-medium">
															{member.name ||
																"Pas de nom"}
														</div>
														<div className="text-xs text-muted-foreground">
															{member.email}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex flex-wrap gap-1 max-w-xs">
													{member.tags.length > 0 ? (
														member.tags.map(
															(tag) => (
																<TagBadge
																	key={tag.id}
																	name={
																		tag.name
																	}
																	color={
																		tag.color
																	}
																	size="sm"
																/>
															)
														)
													) : (
														<span className="text-sm text-muted-foreground italic">
															Aucun plan
														</span>
													)}
												</div>
											</TableCell>
											<TableCell>
												<span className="text-sm text-muted-foreground">
													{members.find(
														(m) =>
															m.id === member.id
													)?.joinedAt
														? formatDistanceToNow(
																new Date(
																	members.find(
																		(m) =>
																			m.id ===
																			member.id
																	)!.joinedAt
																),
																{
																	addSuffix:
																		true,
																	locale: fr,
																}
														  )
														: "Date inconnue"}
												</span>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
