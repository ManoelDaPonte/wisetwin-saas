import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  // Example data - in a real app, this would come from your backend
  const courses = [
    {
      title: "Introduction à Wisetwin",
      progress: 75,
      status: "En cours",
      lastAccessed: "Il y a 2 jours"
    },
    {
      title: "Formation sécurité",
      progress: 30,
      status: "En cours",
      lastAccessed: "Il y a 5 jours"
    },
    {
      title: "Maintenance préventive",
      progress: 100,
      status: "Terminé",
      lastAccessed: "Il y a 1 semaine"
    }
  ]

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Tableau de bord</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Votre progression</CardTitle>
            <CardDescription>
              Suivez votre avancement dans les différentes formations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {courses.map((course) => (
                <div key={course.title} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{course.title}</h3>
                    <span className="text-sm text-muted-foreground">{course.status}</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{course.progress}% complété</span>
                    <span>Dernière activité : {course.lastAccessed}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 