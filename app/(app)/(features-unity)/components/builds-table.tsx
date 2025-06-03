"use client"

import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Download, FileCode, Loader2 } from "lucide-react"
import { Build } from "@/lib/azure"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BuildsTableProps {
  builds: { builds: Build[] } | undefined
  isLoading: boolean
  error: Error | null
  title: string
  description?: string
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export function BuildsTable({ 
  builds, 
  isLoading, 
  error, 
  title,
  description 
}: BuildsTableProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erreur lors du chargement des builds: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-9 w-[100px]" />
              </div>
            ))}
          </div>
        ) : builds?.builds && builds.builds.length > 0 ? (
          <div className="space-y-4">
            {builds.builds.map((build) => (
              <div 
                key={build.name} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <FileCode className="h-8 w-8 text-muted-foreground" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{build.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {formatFileSize(build.totalSize)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Modifié {build.lastModified ? formatDistanceToNow(new Date(build.lastModified), { 
                        addSuffix: true,
                        locale: fr 
                      }) : 'récemment'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      // TODO: Implémenter le lancement du build Unity
                      console.log('Lancer le build:', build.name)
                    }}
                  >
                    Lancer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun build trouvé</p>
            <p className="text-sm mt-1">Uploadez des builds Unity dans le dossier correspondant</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}