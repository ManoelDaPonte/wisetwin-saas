"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useOrganizationStore, useIsPersonalSpace } from "@/stores/organization-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function OrganizationPage() {
  const { activeOrganization } = useOrganizationStore()
  const isPersonalSpace = useIsPersonalSpace()
  const router = useRouter()
  
  useEffect(() => {
    if (isPersonalSpace) {
      router.push('/dashboard')
    }
  }, [isPersonalSpace, router])
  
  if (!activeOrganization) {
    return null
  }
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Gestion de l'organisation: {activeOrganization.name}</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'organisation</CardTitle>
            <CardDescription>
              Gérez les paramètres et les membres de votre organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom de l'organisation</label>
                <Input placeholder="Nom de votre organisation" defaultValue={activeOrganization.name} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Description de votre organisation" defaultValue={activeOrganization.description || ""} />
              </div>
              
              <div className="pt-4">
                <Button>Sauvegarder les modifications</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Membres de l'organisation</CardTitle>
            <CardDescription>
              Gérez les membres et leurs rôles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input placeholder="Rechercher un membre..." />
                <Button variant="outline">Inviter un membre</Button>
              </div>
              
              <div className="border rounded-lg">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-muted-foreground">john@example.com</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Administrateur</span>
                      <Button variant="ghost" size="sm">Modifier</Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Jane Smith</p>
                      <p className="text-sm text-muted-foreground">jane@example.com</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Membre</span>
                      <Button variant="ghost" size="sm">Modifier</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
