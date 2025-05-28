"use client"

import { useOrganizationStore, useIsPersonalSpace } from "@/stores/organization-store"
import { useAzureContext } from "@/hooks/use-azure-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestContextPage() {
  const { activeOrganization, organizations } = useOrganizationStore()
  const isPersonalSpace = useIsPersonalSpace()
  const { containerId, isReady, getAzurePath } = useAzureContext()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Test du Contexte Organisation</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>État du Store Zustand</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="font-semibold">Mode espace personnel:</dt>
              <dd>{isPersonalSpace ? "Oui" : "Non"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Organisation active:</dt>
              <dd>{activeOrganization ? activeOrganization.name : "Aucune"}</dd>
            </div>
            <div>
              <dt className="font-semibold">ID Organisation:</dt>
              <dd>{activeOrganization?.id || "N/A"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Nombre d&apos;organisations:</dt>
              <dd>{organizations.length}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contexte Azure</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="font-semibold">Container ID:</dt>
              <dd className="font-mono text-sm">{containerId || "Non défini"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Est prêt:</dt>
              <dd>{isReady ? "Oui" : "Non"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Exemple de path Azure:</dt>
              <dd className="font-mono text-sm">{getAzurePath("test/file.txt")}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des organisations</CardTitle>
        </CardHeader>
        <CardContent>
          {organizations.length > 0 ? (
            <ul className="space-y-2">
              {organizations.map((org) => (
                <li key={org.id} className="p-2 border rounded">
                  <div className="font-semibold">{org.name}</div>
                  <div className="text-sm text-gray-600">
                    Role: {org.role} | Container: {org.azureContainerId || "Non défini"}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucune organisation</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}