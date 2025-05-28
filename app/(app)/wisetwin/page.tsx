import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function WisetwinPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Wisetwin - Exploration 3D</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Environnement 3D Immersif</CardTitle>
            <CardDescription>
              Explorez votre environnement en 3D pour une meilleure compréhension
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Vue 3D à venir</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 