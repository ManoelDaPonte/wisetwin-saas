import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function WisetrainerPage() {
  const courses = [
    {
      title: "Introduction à Wisetwin",
      description: "Apprenez les bases de l'interface et de la navigation",
      duration: "2 heures",
      level: "Débutant"
    },
    {
      title: "Formation sécurité",
      description: "Maîtrisez les procédures de sécurité essentielles",
      duration: "4 heures",
      level: "Intermédiaire"
    },
    {
      title: "Maintenance préventive",
      description: "Découvrez les bonnes pratiques de maintenance",
      duration: "6 heures",
      level: "Avancé"
    }
  ]

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Wisetrainer - Formations 3D</h1>
      
      <div className="grid gap-6">
        {courses.map((course) => (
          <Card key={course.title}>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Durée : {course.duration}</span>
                <span>•</span>
                <span>Niveau : {course.level}</span>
              </div>
              <div className="mt-4">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                  Commencer la formation
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
