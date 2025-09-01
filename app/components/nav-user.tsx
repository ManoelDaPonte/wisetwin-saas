"use client";

import { ChevronsUpDown, LogOut, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useSession, signOut } from "next-auth/react";
import { useOrganizationStore } from "@/stores/organization-store";
import { getDisplayName, getUserInitials } from "@/lib/user-utils";

export function NavUser() {
	const { data: session } = useSession();
	const { isMobile } = useSidebar();
	const router = useRouter();
	const clearStore = useOrganizationStore((state) => state.clearStore);

	if (!session?.user) {
		return null;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage
									src={session.user.image || ""}
									alt={getDisplayName(session.user)}
								/>
								<AvatarFallback className="rounded-lg">
									{getUserInitials(session.user)}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{getDisplayName(session.user)}
								</span>
								<span className="truncate text-xs">
									{session.user.email}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										src={session.user.image || ""}
										alt={getDisplayName(session.user)}
									/>
									<AvatarFallback className="rounded-lg">
										{getUserInitials(session.user)}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{getDisplayName(session.user)}
									</span>
									<span className="truncate text-xs">
										{session.user.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => router.push("/parametres")}
							>
								<Settings2 className="mr-2 h-4 w-4" />
								Paramètres
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									clearStore();
									signOut({ callbackUrl: "/login" });
								}}
							>
								<LogOut className="mr-2 h-4 w-4" />
								Déconnexion
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
