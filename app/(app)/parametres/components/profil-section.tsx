"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { getDisplayName, getUserInitials } from "@/lib/user-utils"
import { useTranslations } from "@/hooks/use-translations"

export function ProfilSection() {
  const t = useTranslations()
  const { data: session } = useSession()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.settings.profile.title}</CardTitle>
        <CardDescription>{t.settings.profile.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={session?.user?.image || ""} alt={getDisplayName(session?.user || {})} />
            <AvatarFallback>
              {getUserInitials(session?.user || {})}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-lg">{getDisplayName(session?.user || {})}</p>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}