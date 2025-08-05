"use client"

import React from "react"
import { type LucideIcon } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { useHoverPrefetch } from "@/app/hooks/use-hover-prefetch"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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
    items?: {
      title: string
      url: string
    }[]
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
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0
          
          if (hasSubItems) {
            const isItemActive = item.items?.some(subItem => pathname === subItem.url) || false
            
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isItemActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                            <a 
                              href={subItem.url}
                              onClick={(e) => {
                                e.preventDefault()
                                router.push(subItem.url)
                              }}
                              onMouseEnter={() => handleHover(subItem.url)}
                            >
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          return (
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
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
})
