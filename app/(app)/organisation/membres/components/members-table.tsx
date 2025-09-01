"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Search,
	ChevronDown,
	ChevronUp,
	ArrowUpDown,
	MoreHorizontal,
	Shield,
	ShieldCheck,
	UserMinus,
	UserX,
	Users,
} from "lucide-react";
import { Member, Invitation } from "@/app/(app)/organisation/hooks/use-members";
import { useSession } from "next-auth/react";
import { useOrganizationStore } from "@/stores/organization-store";
import { getDisplayName, getUserInitials } from "@/lib/user-utils";
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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface MembersTableProps {
	members: Member[];
	invitations: Invitation[];
	isLoading: boolean;
	error: string | null;
	onUpdateRole: (memberId: string, role: "ADMIN" | "MEMBER") => void;
	onRemoveMember: (memberId: string) => void;
	onCancelInvitation: (invitationId: string) => void;
	isUpdating?: boolean;
	isRemoving?: boolean;
	isCancelling?: boolean;
}

type SortField = "name" | "email" | "role" | "joinedAt";
type SortDirection = "asc" | "desc";

interface SortState {
	field: SortField;
	direction: SortDirection;
}

// Type unifié pour les membres et invitations
interface MemberOrInvitation {
	id: string;
	firstName?: string | null;
	name?: string | null;
	email: string;
	role: "OWNER" | "ADMIN" | "MEMBER";
	joinedAt?: string;
	avatarUrl?: string | null;
	isOwner?: boolean;
	type: "member" | "invitation";
	status?: string;
	expiresAt?: string;
}

export function MembersTable({
	members,
	invitations,
	isLoading,
	error,
	onUpdateRole,
	onRemoveMember,
	onCancelInvitation,
	isUpdating,
	isRemoving,
	isCancelling,
}: MembersTableProps) {
	const { data: session } = useSession();
	const { activeOrganization } = useOrganizationStore();
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(10);
	const [sortState, setSortState] = useState<SortState>({
		field: "name",
		direction: "asc",
	});

	const currentUserRole = activeOrganization?.role;
	const canManageMembers =
		currentUserRole === "OWNER" || currentUserRole === "ADMIN";

	// Fonction utilitaire pour formater le nom complet (utilise les utilitaires globaux)
	const getItemDisplayName = (item: MemberOrInvitation) => {
		if (item.type === "invitation") {
			return item.email; // Pour les invitations, afficher l'email
		}
		// Pour les membres, utiliser les utilitaires globaux
		return getDisplayName(item);
	};

	const getItemInitials = (item: MemberOrInvitation) => {
		// Utiliser les utilitaires globaux pour cohérence
		return getUserInitials(item);
	};

	// Combinaison des membres et invitations
	const allMembers: MemberOrInvitation[] = useMemo(() => {
		const membersList: MemberOrInvitation[] = members.map((member) => ({
			...member,
			type: "member" as const,
		}));

		const invitationsList: MemberOrInvitation[] = invitations.map(
			(invitation) => ({
				id: invitation.id,
				email: invitation.email,
				role: invitation.role,
				type: "invitation" as const,
				status: invitation.status,
				expiresAt: invitation.expiresAt,
			})
		);

		return [...membersList, ...invitationsList];
	}, [members, invitations]);

	// Filtrage et tri
	const filteredAndSortedMembers = useMemo(() => {
		const filtered = allMembers.filter(
			(item) => {
				const displayName = getItemDisplayName(item);
				return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					item.email.toLowerCase().includes(searchTerm.toLowerCase());
			}
		);

		// Tri
		filtered.sort((a, b) => {
			let comparison = 0;

			switch (sortState.field) {
				case "name":
					const nameA = getItemDisplayName(a);
					const nameB = getItemDisplayName(b);
					comparison = nameA.localeCompare(nameB);
					break;
				case "email":
					comparison = a.email.localeCompare(b.email);
					break;
				case "role":
					comparison = a.role.localeCompare(b.role);
					break;
				case "joinedAt":
					const dateA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
					const dateB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
					comparison = dateA - dateB;
					break;
			}

			return sortState.direction === "asc" ? comparison : -comparison;
		});

		return filtered;
	}, [allMembers, searchTerm, sortState]);

	// Pagination
	const paginatedMembers = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredAndSortedMembers.slice(
			startIndex,
			startIndex + itemsPerPage
		);
	}, [filteredAndSortedMembers, currentPage, itemsPerPage]);

	const totalPages = Math.ceil(filteredAndSortedMembers.length / itemsPerPage);

	const handleSort = (field: SortField) => {
		setSortState((prev) => ({
			field,
			direction:
				prev.field === field && prev.direction === "asc"
					? "desc"
					: "asc",
		}));
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
			className="h-8 data-[state=open]:bg-accent cursor-pointer hover:bg-accent/50 transition-colors"
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

	if (error) {
		return (
			<Card>
				<CardContent className="py-8">
					<p className="text-center text-muted-foreground">
						Erreur : {error}
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="flex flex-col h-full">
			<CardHeader className="flex-shrink-0">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Membres de l&apos;organisation</CardTitle>
						<CardDescription>
							Gérez les membres et les invitations de votre
							organisation
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Rechercher un membre..."
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
				{!isLoading && filteredAndSortedMembers.length > 0 && (
					<div className="text-sm text-muted-foreground">
						{filteredAndSortedMembers.length} membre
						{filteredAndSortedMembers.length > 1 ? "s" : ""} trouvé
						{filteredAndSortedMembers.length > 1 ? "s" : ""}
					</div>
				)}
			</CardHeader>

			<CardContent className="flex-1 flex flex-col min-h-0">
				{isLoading ? (
					<div className="space-y-4 flex-1">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="flex items-center space-x-4">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-[250px]" />
									<Skeleton className="h-4 w-[200px]" />
								</div>
								<Skeleton className="h-8 w-[100px]" />
							</div>
						))}
					</div>
				) : filteredAndSortedMembers.length > 0 ? (
					<div className="flex flex-col flex-1 min-h-0">
						<div className="flex-1 overflow-auto">
							<Table>
								<TableHeader className="sticky top-0 bg-background z-10">
									<TableRow>
										<TableHead className="w-12"></TableHead>
										<TableHead>
											<SortButton field="name">
												Membre
											</SortButton>
										</TableHead>
										<TableHead>
											<SortButton field="email">
												Email
											</SortButton>
										</TableHead>
										<TableHead>
											<SortButton field="role">
												Rôle
											</SortButton>
										</TableHead>
										<TableHead>
											<SortButton field="joinedAt">
												Membre depuis
											</SortButton>
										</TableHead>
										<TableHead className="w-20">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{paginatedMembers.map((item) => (
										<TableRow
											key={item.id}
											className={
												item.type === "invitation"
													? "opacity-60 border-dashed"
													: ""
											}
										>
											<TableCell>
												<Avatar className="h-8 w-8">
													<AvatarImage
														src={
															item.avatarUrl ||
															undefined
														}
													/>
													<AvatarFallback>
														{getItemInitials(item)}
													</AvatarFallback>
												</Avatar>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="font-medium">
														{getItemDisplayName(item)}
														{item.type ===
															"member" &&
															item.id ===
																session?.user
																	?.id && (
																<span className="text-muted-foreground ml-2 text-sm">
																	(vous)
																</span>
															)}
													</div>
													{item.type ===
														"invitation" && (
														<div className="text-xs text-muted-foreground">
															Invitation en attente
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												<span className="text-sm">
													{item.email}
												</span>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<RoleBadge role={item.role} />
													{item.type ===
														"invitation" && (
														<Badge variant="secondary">
															En attente
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell>
												<span className="text-sm text-muted-foreground">
													{item.joinedAt ? (
														formatDistanceToNow(
															new Date(
																item.joinedAt
															),
															{
																addSuffix: true,
																locale: fr,
															}
														)
													) : item.type ===
													  "invitation" ? (
														`Expire ${formatDistanceToNow(
															new Date(
																item.expiresAt!
															),
															{
																addSuffix: true,
																locale: fr,
															}
														)}`
													) : (
														"Date inconnue"
													)}
												</span>
											</TableCell>
											<TableCell>
												{canManageMembers &&
													item.type === "member" &&
													!item.isOwner &&
													item.id !==
														session?.user?.id && (
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	disabled={
																		isUpdating ||
																		isRemoving
																	}
																>
																	<MoreHorizontal className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																{item.role !==
																	"ADMIN" && (
																	<DropdownMenuItem
																		onClick={() =>
																			onUpdateRole(
																				item.id,
																				"ADMIN"
																			)
																		}
																	>
																		<ShieldCheck className="mr-2 h-4 w-4" />
																		Promouvoir
																		admin
																	</DropdownMenuItem>
																)}
																{item.role ===
																	"ADMIN" && (
																	<DropdownMenuItem
																		onClick={() =>
																			onUpdateRole(
																				item.id,
																				"MEMBER"
																			)
																		}
																	>
																		<Shield className="mr-2 h-4 w-4" />
																		Rétrograder
																		membre
																	</DropdownMenuItem>
																)}
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	onClick={() =>
																		onRemoveMember(
																			item.id
																		)
																	}
																	className="text-destructive"
																>
																	<UserMinus className="mr-2 h-4 w-4" />
																	Retirer
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													)}
												{canManageMembers &&
													item.type === "invitation" && (
														<Button
															variant="ghost"
															size="icon"
															onClick={() =>
																onCancelInvitation(
																	item.id
																)
															}
															disabled={isCancelling}
														>
															<UserX className="h-4 w-4" />
														</Button>
													)}
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
									{filteredAndSortedMembers.length} membre
									{filteredAndSortedMembers.length > 1
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
						<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>
							{searchTerm
								? `Aucun membre trouvé pour "${searchTerm}"`
								: "Aucun membre trouvé"}
						</p>
						{!searchTerm && (
							<p className="text-sm mt-1">
								Invitez des membres pour commencer
							</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function RoleBadge({ role }: { role: "OWNER" | "ADMIN" | "MEMBER" }) {
	const variants = {
		OWNER: { label: "Propriétaire", variant: "default" as const },
		ADMIN: { label: "Admin", variant: "secondary" as const },
		MEMBER: { label: "Membre", variant: "outline" as const },
	};

	const { label, variant } = variants[role];

	return <Badge variant={variant}>{label}</Badge>;
}