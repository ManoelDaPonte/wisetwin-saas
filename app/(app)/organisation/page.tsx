"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useOrganizationStore } from "@/app/stores/organization-store"
import { 
  Building2, 
  Users,
  ArrowRight,
  Settings,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMembers } from "./hooks/use-members"
import { useBuilds } from "@/app/hooks/use-builds"
import { Skeleton } from "@/components/ui/skeleton"

export default function OrganizationPage() {
  const { activeOrganization } = useOrganizationStore()
  const router = useRouter()
  
  const { members, isLoading: isMembersLoading } = useMembers()
  const { data: wisetourBuilds, isLoading: isWisetourLoading } = useBuilds('wisetour')
  const { data: wisetrainerBuilds, isLoading: isWisetrainerLoading } = useBuilds('wisetrainer')
  
  if (!activeOrganization) {
    return null
  }

  const memberCount = members?.length || 0
  const wisetourCount = wisetourBuilds?.length || 0
  const wisetrainerCount = wisetrainerBuilds?.length || 0

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Vue d'ensemble</h1>
        <p className="text-muted-foreground">
          Tableau de bord de votre organisation {activeOrganization.name}
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membres</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isMembersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{memberCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Utilisateurs actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Builds WiseTrainer</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isWisetrainerLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{wisetrainerCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Formations actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Builds Wisetour</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isWisetourLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{wisetourCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Environnements actifs
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Actions rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/organisation/membres')}>
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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/organisation/parametres')}>
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

    </div>
  )
}
