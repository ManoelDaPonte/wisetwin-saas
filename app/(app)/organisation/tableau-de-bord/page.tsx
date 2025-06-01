"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useOrganizationStore } from "@/app/stores/organization-store"
import { 
  Users, 
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react"

// Mock data pour l'avancement des formations
const mockTrainingData = {
  stats: {
    totalUsers: 12,
    activeTrainings: 4,
    completionRate: 68,
    averageTime: "2h 30min",
  },
  trainings: [
    {
      id: 1,
      name: "Formation Sécurité BIM",
      totalUsers: 8,
      completedUsers: 5,
      averageProgress: 62,
      status: "active",
    },
    {
      id: 2,
      name: "Introduction au Digital Twin",
      totalUsers: 6,
      completedUsers: 6,
      averageProgress: 100,
      status: "completed",
    },
    {
      id: 3,
      name: "Maintenance prédictive IoT",
      totalUsers: 4,
      completedUsers: 1,
      averageProgress: 35,
      status: "active",
    },
    {
      id: 4,
      name: "Gestion des données 3D",
      totalUsers: 10,
      completedUsers: 7,
      averageProgress: 85,
      status: "active",
    },
  ],
  recentProgress: [
    {
      userId: 1,
      userName: "Jean Dupont",
      userEmail: "jean.dupont@example.com",
      training: "Formation Sécurité BIM",
      progress: 45,
      lastActivity: "Il y a 2 heures",
      avatar: null,
    },
    {
      userId: 2,
      userName: "Marie Martin",
      userEmail: "marie.martin@example.com",
      training: "Gestion des données 3D",
      progress: 92,
      lastActivity: "Il y a 5 heures",
      avatar: null,
    },
    {
      userId: 3,
      userName: "Pierre Bernard",
      userEmail: "pierre.bernard@example.com",
      training: "Maintenance prédictive IoT",
      progress: 15,
      lastActivity: "Il y a 1 jour",
      avatar: null,
    },
    {
      userId: 4,
      userName: "Sophie Leroy",
      userEmail: "sophie.leroy@example.com",
      training: "Formation Sécurité BIM",
      progress: 78,
      lastActivity: "Il y a 3 jours",
      avatar: null,
    },
  ],
}

export default function OrganizationDashboardPage() {
  const { activeOrganization } = useOrganizationStore()
  
  if (!activeOrganization) {
    return null
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord des formations</h1>
        <p className="text-muted-foreground">
          Suivez l'avancement des formations de vos équipes
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTrainingData.stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +2 ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formations actives</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTrainingData.stats.activeTrainings}</div>
            <p className="text-xs text-muted-foreground">
              3 en cours, 1 terminée
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTrainingData.stats.completionRate}%</div>
            <Progress value={mockTrainingData.stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTrainingData.stats.averageTime}</div>
            <p className="text-xs text-muted-foreground">
              Par formation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vue d'ensemble des formations */}
      <Card>
        <CardHeader>
          <CardTitle>Formations en cours</CardTitle>
          <CardDescription>
            Progression globale par formation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockTrainingData.trainings.map((training) => (
              <div key={training.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{training.name}</h4>
                    {training.status === "completed" ? (
                      <Badge variant="secondary" className="text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Terminée
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Circle className="h-3 w-3 mr-1" />
                        En cours
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {training.completedUsers}/{training.totalUsers} utilisateurs
                  </div>
                </div>
                <Progress value={training.averageProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Progression moyenne: {training.averageProgress}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>
                Dernières progressions des utilisateurs
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Award className="h-4 w-4 mr-2" />
              Assigner des formations
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTrainingData.recentProgress.map((activity) => (
              <div key={activity.userId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={activity.avatar || undefined} />
                    <AvatarFallback>{activity.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{activity.userName}</p>
                    <p className="text-sm text-muted-foreground">{activity.training}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Progress value={activity.progress} className="w-24 h-2" />
                      <span className="text-sm font-medium">{activity.progress}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{activity.lastActivity}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}