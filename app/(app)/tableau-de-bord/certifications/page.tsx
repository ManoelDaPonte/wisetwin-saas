"use client";

import { useState, useMemo, useCallback } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Download,
  FileText,
  FileCode,
  Trophy,
} from "lucide-react";
import { useCertifiedFormations } from "@/app/hooks/use-certified-formations";
import { useContainer } from "@/app/hooks/use-container";
import { useIsPersonalSpace } from "@/stores/organization-store";
import { useTranslations } from "@/hooks/use-translations";
import { useCurrentLanguage } from "@/stores/language-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Image from "next/image";

type SortField = "name" | "completedAt" | "score";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

interface CertifiedFormation {
  build: {
    id?: string;
    name: string;
    buildType?: string;
    metadata?: {
      title?: string | { en: string; fr: string };
      imageUrl?: string;
      [key: string]: unknown;
    } | null;
    imageUrl?: string;
  };
  score: number;
  completedAt: string;
  isFirstSuccess: boolean;
}

export default function CertificationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortState, setSortState] = useState<SortState>({
    field: "completedAt",
    direction: "desc", // Plus récent d'abord
  });
  const [downloadingItems, setDownloadingItems] = useState<Set<string>>(
    new Set()
  );

  const { containerId, organizationId, isReady } = useContainer();
  const isPersonalSpace = useIsPersonalSpace();
  const t = useTranslations();
  const currentLanguage = useCurrentLanguage();
  const dateLocale = currentLanguage === "fr" ? fr : enUS;

  // Helper pour extraire le texte localisé des métadonnées
  const getLocalizedText = useCallback((
    text: string | { en: string; fr: string } | undefined
  ): string | undefined => {
    if (!text) return undefined;
    if (typeof text === "string") return text;
    return text[currentLanguage] || text.fr || text.en;
  }, [currentLanguage]);

  const { certifications, isLoading, error } = useCertifiedFormations();

  const filteredAndSortedFormations = useMemo(() => {
    if (!certifications) return [];

    const filtered = certifications.filter((cert) => {
      const displayName =
        getLocalizedText(cert.build.metadata?.title) || cert.build.name;
      return displayName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortState.field) {
        case "name":
          const nameA =
            getLocalizedText(a.build.metadata?.title) || a.build.name;
          const nameB =
            getLocalizedText(b.build.metadata?.title) || b.build.name;
          comparison = nameA.localeCompare(nameB);
          break;
        case "completedAt":
          const dateA = new Date(a.completedAt).getTime();
          const dateB = new Date(b.completedAt).getTime();
          comparison = dateA - dateB;
          break;
        case "score":
          comparison = a.score - b.score;
          break;
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [certifications, searchTerm, sortState, getLocalizedText]);

  const paginatedFormations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedFormations.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedFormations, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(
    filteredAndSortedFormations.length / itemsPerPage
  );

  const handleSort = (field: SortField) => {
    setSortState((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDownloadCertificate = async (cert: CertifiedFormation) => {
    if (!isReady || !containerId) {
      toast.error(t.certifications.errors.organizationMissing);
      return;
    }

    const buildId = cert.build.id || cert.build.name;
    setDownloadingItems((prev) => new Set(prev).add(buildId));

    try {
      // Utiliser l'API appropriée selon le contexte
      let apiUrl: string;
      const params = new URLSearchParams({
        buildName: cert.build.name,
        buildType: "wisetrainer",
      });

      if (isPersonalSpace) {
        // Espace personnel - utiliser l'API personnelle
        apiUrl = `/api/certificates/generate-personal?${params.toString()}`;
      } else {
        // Organisation - utiliser l'API avec org auth
        params.append("containerId", containerId);
        if (organizationId) {
          params.append("organizationId", organizationId);
        }
        apiUrl = `/api/certificates/generate?${params.toString()}`;
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t.certifications.errors.downloadFailed);
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      const displayName =
        getLocalizedText(cert.build.metadata?.title) || cert.build.name;
      a.download = `Certificat-${displayName.replace(
        /[^a-zA-Z0-9]/g,
        "-"
      )}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t.certifications.success.downloadComplete);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t.certifications.errors.downloadFailed
      );
    } finally {
      setDownloadingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(buildId);
        return newSet;
      });
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 data-[state=open]:bg-accent"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortState.field === field ? (
        sortState.direction === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {t.certifications.errors.downloadFailed}: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {t.certifications.title}
            </CardTitle>
            <CardDescription>{t.certifications.subtitle}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.certifications.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
        {!isLoading && filteredAndSortedFormations.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {filteredAndSortedFormations.length}{" "}
            {filteredAndSortedFormations.length === 1
              ? t.certifications.stats.availableSingular
              : t.certifications.stats.availablePlural}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {isLoading ? (
          <div className="space-y-4 flex-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-[100px]" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedFormations.length > 0 ? (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>
                      <SortButton field="name">
                        {t.certifications.table.formation}
                      </SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="score">Score</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="completedAt">
                        {t.certifications.table.completionDate}
                      </SortButton>
                    </TableHead>
                    <TableHead className="w-32">
                      {t.certifications.table.actions}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFormations.map((cert) => {
                    const buildId = cert.build.id || cert.build.name;
                    const displayName =
                      getLocalizedText(cert.build.metadata?.title) ||
                      cert.build.name;
                    const imageUrl =
                      cert.build.imageUrl ||
                      (typeof cert.build.metadata?.imageUrl === 'string' ? cert.build.metadata.imageUrl : undefined);
                    return (
                      <TableRow key={buildId}>
                        <TableCell>
                          {imageUrl && typeof imageUrl === 'string' ? (
                            <Image
                              src={imageUrl}
                              alt={displayName}
                              width={40}
                              height={40}
                              className="h-10 w-10 object-cover rounded-md"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                              <FileCode className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{displayName}</div>
                            <Badge variant="outline" className="text-xs">
                              Meilleur score
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {Math.round(cert.score)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {format(
                                new Date(cert.completedAt),
                                currentLanguage === "fr"
                                  ? "d MMMM yyyy 'à' HH:mm"
                                  : "MMMM d, yyyy 'at' HH:mm",
                                { locale: dateLocale }
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(cert.completedAt), {
                                addSuffix: true,
                                locale: dateLocale,
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadCertificate(cert)}
                            disabled={downloadingItems.has(buildId)}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            {downloadingItems.has(buildId)
                              ? t.certifications.table.generating
                              : t.certifications.table.downloadButton}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4 flex-shrink-0 border-t">
                <div className="text-sm text-muted-foreground">
                  {t.certifications.pagination.page} {currentPage}{" "}
                  {t.certifications.pagination.of} {totalPages} (
                  {filteredAndSortedFormations.length}{" "}
                  {filteredAndSortedFormations.length === 1
                    ? t.certifications.stats.availableSingular
                    : t.certifications.stats.availablePlural}
                  )
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    {t.certifications.pagination.previous}
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from(
                      {
                        length: Math.min(5, totalPages),
                      },
                      (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={
                              currentPage === pageNum ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    {t.certifications.pagination.next}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground flex-1 flex flex-col justify-center">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {searchTerm
                ? `${t.certifications.empty.noResults} "${searchTerm}"`
                : t.certifications.empty.noCertifications}
            </p>
            {!searchTerm && (
              <p className="text-sm mt-1">
                {t.certifications.empty.getStarted}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
