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
          <h1 className="text-3xl font-bold">Welcome to WiseTwin</h1>
          <p className="text-muted-foreground">
            Get started by joining an existing organization or creating your own.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Join Organization
              </CardTitle>
              <CardDescription>
                Join an existing organization using an invitation link or code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;ll need an invitation link or code from the organization administrator to join.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Enter Invitation Code
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Organization
              </CardTitle>
              <CardDescription>
                Create a new organization to collaborate with your team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;ll be the owner of the organization and can invite team members.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Create Organization
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 