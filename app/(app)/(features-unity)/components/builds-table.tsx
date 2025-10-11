"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
  FileCode,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Play,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useContainer } from "@/app/hooks/use-container";
import { Build } from "@/types/azure";
import { useCurrentLanguage } from "@/stores/language-store";
import { useTranslations } from "@/hooks/use-translations";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

interface BuildsTableProps {
  builds: { builds: Build[] } | undefined;
  isLoading: boolean;
  error: Error | null;
  title: string;
  description?: string;
  mode?: "catalog" | "my-trainings" | "completed";
}

type SortField = "name" | "category" | "lastModified" | "version";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

export function BuildsTable({
  builds,
  isLoading,
  error,
  title,
  description,
  mode = "catalog",
}: BuildsTableProps) {
  const router = useRouter();
  const { containerId } = useContainer();
  const currentLanguage = useCurrentLanguage();
  const t = useTranslations();
  const dateLocale = currentLanguage === "fr" ? fr : enUS;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortState, setSortState] = useState<SortState>({
    field: "name",
    direction: "asc",
  });

  // Contenu unifié - tous les builds sont des formations
  const contentType = "formation";
  const contentTypePlural = "formations";

  // Helper pour extraire le texte localisé des métadonnées
  const getLocalizedText = (text: string | { en: string; fr: string } | undefined): string | undefined => {
    if (!text) return undefined;
    if (typeof text === "string") return text;
    return text[currentLanguage] || text.fr || text.en;
  };

  const filteredAndSortedBuilds = useMemo(() => {
    if (!builds?.builds) return [];

    const filtered = builds.builds.filter(
      (build) =>
        build.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (build.description &&
          build.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (build.category &&
          build.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortState.field) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "category":
          comparison = (a.category || "").localeCompare(b.category || "");
          break;
        case "lastModified":
          const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
          const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case "version":
          comparison = (a.version || "").localeCompare(b.version || "");
          break;
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [builds?.builds, searchTerm, sortState]);

  const paginatedBuilds = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedBuilds.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedBuilds, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedBuilds.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    setSortState((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleLaunchFormationClick = (build: Build) => {
    const buildId = encodeURIComponent(build.id || build.name);
    router.push(`/${build.buildType}/${containerId}/${buildId}`);
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
      <Alert variant="destructive">
        <AlertDescription>
          {t.buildsTable.errors.loadingError} {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.buildsTable.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
        {!isLoading && filteredAndSortedBuilds.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {filteredAndSortedBuilds.length} {filteredAndSortedBuilds.length > 1 ? t.buildsTable.stats.formationPlural : t.buildsTable.stats.formationSingular}
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
        ) : filteredAndSortedBuilds.length > 0 ? (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>
                      <SortButton field="name">{t.buildsTable.table.formation}</SortButton>
                    </TableHead>
                    <TableHead>{t.buildsTable.table.tags}</TableHead>
                    <TableHead>{t.buildsTable.table.difficulty}</TableHead>
                    <TableHead>{t.buildsTable.table.duration}</TableHead>
                    <TableHead>
                      <SortButton field="version">{t.buildsTable.table.version}</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="lastModified">{t.buildsTable.table.modified}</SortButton>
                    </TableHead>
                    <TableHead className="w-20">{t.buildsTable.table.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBuilds.map((build) => (
                    <TableRow key={build.id || build.name}>
                      <TableCell>
                        {build.imageUrl ? (
                          <Image
                            src={build.imageUrl}
                            alt={build.name}
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
                          <div className="font-medium">
                            {getLocalizedText(build.metadata?.title) || build.name}
                          </div>
                          {(getLocalizedText(build.metadata?.description) || build.description) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-sm text-muted-foreground line-clamp-2 max-w-md cursor-help">
                                  {getLocalizedText(build.metadata?.description) || build.description}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-md">
                                <p className="whitespace-normal">
                                  {getLocalizedText(build.metadata?.description) || build.description}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      {/* Tags */}
                      <TableCell>
                        {build.metadata?.tags &&
                        Array.isArray(build.metadata.tags) &&
                        build.metadata.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {build.metadata.tags
                              .slice(0, 2)
                              .map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            {build.metadata.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{build.metadata.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {t.buildsTable.placeholders.empty}
                          </span>
                        )}
                      </TableCell>

                      {/* Difficulté */}
                      <TableCell>
                        {build.metadata?.difficulty &&
                        typeof build.metadata.difficulty === "string" ? (
                          <Badge variant="secondary" className="text-xs">
                            {build.metadata.difficulty}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {t.buildsTable.placeholders.empty}
                          </span>
                        )}
                      </TableCell>

                      {/* Durée */}
                      <TableCell>
                        {build.metadata?.duration &&
                        typeof build.metadata.duration === "string" ? (
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                            {build.metadata.duration}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {t.buildsTable.placeholders.empty}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {build.metadata?.version &&
                          typeof build.metadata.version === "string"
                            ? build.metadata.version
                            : build.version || "1.0.0"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {build.lastModified
                            ? formatDistanceToNow(
                                new Date(build.lastModified),
                                {
                                  addSuffix: true,
                                  locale: dateLocale,
                                }
                              )
                            : t.buildsTable.time.recently}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLaunchFormationClick(build)}
                          className="flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          {mode === "completed"
                            ? t.buildsTable.buttons.relaunch
                            : t.buildsTable.buttons.launch}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4 flex-shrink-0 border-t">
                <div className="text-sm text-muted-foreground">
                  {t.buildsTable.pagination.page} {currentPage} {t.buildsTable.pagination.of} {totalPages} (
                  {filteredAndSortedBuilds.length} {filteredAndSortedBuilds.length > 1 ? t.buildsTable.pagination.formationPlural : t.buildsTable.pagination.formationSingular})
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
                    {t.buildsTable.pagination.previous}
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    {t.buildsTable.pagination.next}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground flex-1 flex flex-col justify-center">
            <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {searchTerm
                ? `${t.buildsTable.empty.noResults} "${searchTerm}"`
                : t.buildsTable.empty.noFormations}
            </p>
            {!searchTerm && (
              <p className="text-sm mt-1">
                {mode === "catalog"
                  ? t.buildsTable.empty.uploadBuilds
                  : t.buildsTable.empty.noStarted}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
