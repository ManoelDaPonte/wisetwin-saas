import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Bienvenue sur Wisetwin</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Commencer votre parcours</CardTitle>
            <CardDescription>
              Voici les étapes à suivre pour débuter votre formation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Explorer Wisetwin</h3>
                  <p className="text-muted-foreground">
                    Découvrez l'environnement 3D immersif de Wisetwin pour vous familiariser avec l'interface.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Suivre les formations Wisetrainer</h3>
                  <p className="text-muted-foreground">
                    Accédez à vos formations 3D interactives pour développer vos compétences.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Suivre votre progression</h3>
                  <p className="text-muted-foreground">
                    Consultez votre tableau de bord pour suivre votre avancement dans les différentes formations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 