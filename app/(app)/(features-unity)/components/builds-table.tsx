"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  FileCode,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  MoreHorizontal,
  Play,
  Heart,
  HeartOff,
  UserMinus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Build, BuildType } from "@/lib/azure";
import { useBuilds } from "@/app/hooks/use-builds";
import { useContainer } from "@/app/hooks/use-container";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BuildsTableProps {
  builds: { builds: Build[] } | undefined;
  isLoading: boolean;
  error: Error | null;
  title: string;
  description?: string;
  mode?: "catalog" | "my-trainings";
  followBuild?: (params: { buildName: string; buildType: BuildType }) => void;
  unfollowBuild?: (params: { buildName: string; buildType: BuildType }) => void;
  isFollowLoading?: boolean;
  isUnfollowLoading?: boolean;
}

type SortField =
  | "name"
  | "category"
  | "difficulty"
  | "duration"
  | "lastModified"
  | "totalSize";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

function getDifficultyOrder(difficulty: string | undefined): number {
  if (!difficulty) return 0;
  const order = {
    Débutant: 1,
    Beginner: 1,
    Intermédiaire: 2,
    Intermediate: 2,
    Avancé: 3,
    Advanced: 3,
  };
  return order[difficulty as keyof typeof order] || 0;
}

function parseDuration(duration: string | undefined): number {
  if (!duration) return 0;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export function BuildsTable({
  builds,
  isLoading,
  error,
  title,
  description,
  mode = "catalog",
  followBuild,
  unfollowBuild,
  isFollowLoading,
  isUnfollowLoading,
}: BuildsTableProps) {
  const router = useRouter();
  const { containerId } = useContainer();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortState, setSortState] = useState<SortState>({
    field: "name",
    direction: "asc",
  });

  // Détecter le type de contenu basé sur les builds
  const buildType = builds?.builds?.[0]?.buildType;
  const isWisetour = buildType === "wisetour";
  const contentType = isWisetour ? "visite" : "formation";
  const contentTypePlural = isWisetour ? "visites" : "formations";

  const filteredAndSortedBuilds = useMemo(() => {
    if (!builds?.builds) return [];

    let filtered = builds.builds.filter(
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
        case "difficulty":
          comparison =
            getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty);
          break;
        case "duration":
          comparison = parseDuration(a.duration) - parseDuration(b.duration);
          break;
        case "lastModified":
          const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
          const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case "totalSize":
          comparison = a.totalSize - b.totalSize;
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

  const handleLaunchClick = (build: Build) => {
    const buildId = build.id || build.name;
    router.push(`/${build.buildType}/${encodeURIComponent(buildId)}`);
  };

  const handleFollowClick = (build: Build) => {
    if (followBuild) {
      followBuild({
        buildName: build.name,
        buildType: build.buildType,
      });
    }
  };

  const handleUnfollowClick = (build: Build) => {
    if (unfollowBuild) {
      unfollowBuild({
        buildName: build.name,
        buildType: build.buildType,
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
      <Alert variant="destructive">
        <AlertDescription>
          Erreur lors du chargement des builds: {error.message}
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
                placeholder={`Rechercher une ${contentType}...`}
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
            {filteredAndSortedBuilds.length} {contentType}
            {filteredAndSortedBuilds.length > 1 ? "s" : ""} trouvée
            {filteredAndSortedBuilds.length > 1 ? "s" : ""}
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
                      <SortButton field="name">Formation</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="category">Catégorie</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="difficulty">Difficulté</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="duration">Durée</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="totalSize">Taille</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="lastModified">Modifié</SortButton>
                    </TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBuilds.map((build) => (
                    <TableRow key={build.id || build.name}>
                      <TableCell>
                        {build.imageUrl ? (
                          <img
                            src={build.imageUrl}
                            alt={build.name}
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
                          <div className="font-medium">{build.name}</div>
                          {build.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                              {build.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {build.category && (
                          <Badge variant="outline">{build.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {build.difficulty && (
                          <Badge
                            variant={
                              build.difficulty
                                .toLowerCase()
                                .includes("débutant") ||
                              build.difficulty
                                .toLowerCase()
                                .includes("beginner")
                                ? "secondary"
                                : build.difficulty
                                    .toLowerCase()
                                    .includes("avancé") ||
                                  build.difficulty
                                    .toLowerCase()
                                    .includes("advanced")
                                ? "destructive"
                                : "default"
                            }
                          >
                            {build.difficulty}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {build.duration && (
                          <span className="text-sm">{build.duration}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(build.totalSize)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {build.lastModified
                            ? formatDistanceToNow(
                                new Date(build.lastModified),
                                {
                                  addSuffix: true,
                                  locale: fr,
                                }
                              )
                            : "récemment"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {mode === "catalog" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFollowClick(build)}
                            disabled={isFollowLoading}
                            className="w-20"
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            {isFollowLoading ? "..." : "Suivre"}
                          </Button>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir le menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleLaunchClick(build)}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Lancer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUnfollowClick(build)}
                                disabled={isUnfollowLoading}
                                className="text-destructive focus:text-destructive"
                              >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Ne plus suivre
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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
                  Page {currentPage} sur {totalPages} (
                  {filteredAndSortedBuilds.length} {contentType}
                  {filteredAndSortedBuilds.length > 1 ? "s" : ""})
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
                    Précédent
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
                    Suivant
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
                ? `Aucune ${contentType} trouvée pour "${searchTerm}"`
                : `Aucune ${contentType} trouvée`}
            </p>
            {!searchTerm && (
              <p className="text-sm mt-1">
                {mode === "catalog"
                  ? "Uploadez des builds Unity dans le dossier correspondant"
                  : `Vous n'avez pas encore commencé de ${contentTypePlural}`}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
