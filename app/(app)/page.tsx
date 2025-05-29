import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Building2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function HomePage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="container max-w-5xl py-6">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Bienvenue sur WiseTwin</h1>
          <p className="text-muted-foreground">
            Commencez par rejoindre une organisation existante ou créez la vôtre.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Rejoindre une organisation
              </CardTitle>
              <CardDescription>
                Rejoignez une organisation existante avec un lien ou un code d'invitation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Vous aurez besoin d'un lien ou d'un code d'invitation de l'administrateur de l'organisation.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Entrer le code d'invitation
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Créer une organisation
              </CardTitle>
              <CardDescription>
                Créez une nouvelle organisation pour collaborer avec votre équipe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Vous serez le propriétaire de l'organisation et pourrez inviter des membres.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Créer une organisation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 