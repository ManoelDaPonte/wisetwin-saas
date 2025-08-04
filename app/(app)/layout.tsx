import { AppSidebar } from "@/app/components/app-sidebar";
import { AppBreadcrumb } from "@/app/components/app-breadcrumb";
import { LogoBackground } from "@/app/components/logo-background";
import { PrefetchProvider } from "@/app/providers/prefetch-provider";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<PrefetchProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className="flex flex-col min-h-screen">
					<LogoBackground />
					<div className="relative z-10 flex flex-col flex-1 min-h-0">
						<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
							<div className="flex items-center gap-2 px-4">
								<SidebarTrigger className="-ml-1" />
								<Separator
									orientation="vertical"
									className="mr-2 !h-4"
								/>
								<Breadcrumb>
									<AppBreadcrumb />
								</Breadcrumb>
							</div>
						</header>
						<div className="flex-1 pb-4 pr-4 pl-4 pt-0 min-h-0">
							{children}
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</PrefetchProvider>
	);
}
