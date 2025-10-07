"use client"

import React from "react"
import { type LucideIcon } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useHoverPrefetch } from "@/app/hooks/use-hover-prefetch"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export const NavMain = React.memo(function NavMain({
  items,
  label = "Navigation",
}: {
  items: Array<{
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
  }>
  label?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { handleHover } = useHoverPrefetch()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={pathname === item.url}
              onClick={() => router.push(item.url)}
              onMouseEnter={() => handleHover(item.url)}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
})
