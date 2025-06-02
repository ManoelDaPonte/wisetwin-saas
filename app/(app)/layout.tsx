import { AppSidebar } from "@/app/components/app-sidebar"
import { AppBreadcrumb } from "@/app/components/app-breadcrumb"
import { LogoBackground } from "@/app/components/logo-background"
import { PrefetchProvider } from "@/app/providers/prefetch-provider"
import {
  Breadcrumb,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PrefetchProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <LogoBackground />
          <div className="relative z-10">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 !h-4" />
                <Breadcrumb>
                  <AppBreadcrumb />
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PrefetchProvider>
  )
} 