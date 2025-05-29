import { AppSidebar } from "@/app/components/app-sidebar"
import { LogoBackground } from "@/app/components/logo-background"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"


export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <LogoBackground />
        <div className="relative z-10">
          <SidebarTrigger />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 