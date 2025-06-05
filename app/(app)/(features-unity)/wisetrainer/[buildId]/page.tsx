"use client";

import { useParams } from "next/navigation";
import { useBuilds } from "@/app/hooks/use-builds";
import { Build, BuildFile } from "@/lib/azure";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WisetrainerBuildPage({
  params: routeParams,
}: {
  params: { buildId: string };
}) {
  const params = useParams();
  const buildId = Array.isArray(params.buildId)
    ? params.buildId[0]
    : params.buildId;

  const { data: buildsData, isLoading, error } = useBuilds("wisetrainer");

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors du chargement des données de la formation:{" "}
            {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const build = buildsData?.builds?.find((b) => (b.id || b.name) === buildId);

  if (!build) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Alert>
          <AlertDescription>Formation non trouvée.</AlertDescription>
        </Alert>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/wisetrainer">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à Wisetrainer
          </Link>
        </Button>
      </div>
    );
  }

  const renderFileDetails = (file: BuildFile | undefined) => {
    if (!file)
      return <p className="text-sm text-muted-foreground">Non disponible</p>;
    return (
      <div className="text-sm">
        <p>Nom: {file.name}</p>
        <p>Taille: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
        <p>
          Modifié:{" "}
          {file.lastModified
            ? new Date(file.lastModified).toLocaleDateString()
            : "N/A"}
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/wisetrainer">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:gap-4">
            {build.imageUrl && (
              <img
                src={build.imageUrl}
                alt={build.name}
                className="w-full md:w-1/3 h-auto object-cover rounded-lg mb-4 md:mb-0"
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold">{build.name}</CardTitle>
              {build.description && (
                <CardDescription className="mt-2 text-lg">
                  {build.description}
                </CardDescription>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {build.category && (
                  <Badge variant="secondary">{build.category}</Badge>
                )}
                {build.difficulty && (
                  <Badge variant="secondary">
                    Difficulté: {build.difficulty}
                  </Badge>
                )}
                {build.duration && (
                  <Badge variant="secondary">Durée: {build.duration}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {build.modules && build.modules.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-3">
                Modules de formation
              </h2>
              <div className="space-y-4">
                {build.modules.map((module, index) => (
                  <Card key={module.id || index} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>{module.title}</CardTitle>
                      {module.description && (
                        <CardDescription>{module.description}</CardDescription>
                      )}
                    </CardHeader>
                    {module.educational?.content?.intro && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          {module.educational.content.intro}
                        </p>
                        {module.educational.content.sections?.map(
                          (section: any, sIndex: number) => (
                            <div key={sIndex} className="mb-2">
                              <h4 className="font-semibold">{section.title}</h4>
                              {section.text && (
                                <p className="text-sm">{section.text}</p>
                              )}
                              {section.items && (
                                <ul className="list-disc list-inside text-sm">
                                  {section.items.map(
                                    (item: string, iIndex: number) => (
                                      <li key={iIndex}>{item}</li>
                                    )
                                  )}
                                </ul>
                              )}
                            </div>
                          )
                        )}
                      </CardContent>
                    )}
                    {module.steps && module.steps.length > 0 && (
                      <CardContent>
                        <h3 className="text-lg font-semibold mb-2">Étapes</h3>
                        <ul className="list-decimal list-inside space-y-1">
                          {module.steps.map((step: any) => (
                            <li key={step.id} className="text-sm">
                              <strong>{step.title}:</strong> {step.instruction}
                              {step.hint && (
                                <em className="text-xs block text-muted-foreground">
                                  {" "}
                                  (Astuce: {step.hint})
                                </em>
                              )}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-semibold mb-3">
              Fichiers du Build (Azure)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Loader</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderFileDetails(build.files.loader)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Framework</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderFileDetails(build.files.framework)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Wasm</CardTitle>
                </CardHeader>
                <CardContent>{renderFileDetails(build.files.wasm)}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Data</CardTitle>
                </CardHeader>
                <CardContent>{renderFileDetails(build.files.data)}</CardContent>
              </Card>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Taille totale: {(build.totalSize / (1024 * 1024)).toFixed(2)} MB
            </p>
            <p className="text-sm text-muted-foreground">
              Dernière modification (Azure):{" "}
              {build.lastModified
                ? new Date(build.lastModified).toLocaleString()
                : "N/A"}
            </p>
          </div>

          {build.objectMapping &&
            Object.keys(build.objectMapping).length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-3">Object Mapping</h2>
                <Card>
                  <CardContent className="pt-6">
                    <ul className="list-disc list-inside space-y-1">
                      {Object.entries(build.objectMapping).map(
                        ([key, value]) => (
                          <li key={key} className="text-sm">
                            <strong>{key}:</strong> {String(value)}
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
