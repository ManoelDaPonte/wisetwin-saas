"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Settings, Users, GraduationCap, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

interface OrganizationActionsProps {
  canManage: boolean
}

export function OrganizationActions({ canManage }: OrganizationActionsProps) {
  const router = useRouter()

  if (!canManage) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => router.push('/organisation/membres')}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Gérer les membres</CardTitle>
                <CardDescription>Inviter et gérer les accès</CardDescription>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
      </Card>

      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => router.push('/organisation/plan-de-formation')}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Plans de formation</CardTitle>
                <CardDescription>Gérer les parcours de formation</CardDescription>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
      </Card>

      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => router.push('/statistiques')}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Statistiques</CardTitle>
                <CardDescription>Analyser les performances</CardDescription>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
      </Card>

      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => router.push('/organisation/parametres')}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Paramètres</CardTitle>
                <CardDescription>Configurer votre organisation</CardDescription>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}