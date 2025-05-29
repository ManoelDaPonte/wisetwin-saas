"use client"

import Image from "next/image"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function LogoBackground() {
  const { state, isMobile } = useSidebar()
  
  return (
    <div 
      className={cn(
        "fixed inset-0 flex items-center justify-center pointer-events-none transition-all duration-200",
        // Ajuster le padding en fonction de l'état de la sidebar
        !isMobile && state === "expanded" && "pl-[16rem]",
        !isMobile && state === "collapsed" && "pl-[3rem]",
        "z-0"
      )}
    >
      <div className="relative w-96 h-96 opacity-5">
        <Image
          src="/logo_wisetwin_dark.svg"
          alt="Wisetwin Logo"
          fill
          priority
          className="object-contain dark:hidden"
        />
        <Image
          src="/logo_wisetwin_light.svg"
          alt="Wisetwin Logo"
          fill
          priority
          className="object-contain hidden dark:block"
        />
      </div>
    </div>
  )
}