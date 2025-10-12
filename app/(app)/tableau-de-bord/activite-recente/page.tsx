"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Play,
  FileCode,
  Trophy,
} from "lucide-react";
import { useRecentActivityWithDetails } from "@/app/hooks/use-recent-activity-with-details";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useContainer } from "@/app/hooks/use-container";
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
import Image from "next/image";

type SortField = "buildName" | "timestamp" | "score";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

export default function ActivityPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { containerId } = useContainer();
  const t = useTranslations();
  const currentLanguage = useCurrentLanguage();
  const dateLocale = currentLanguage === "fr" ? fr : enUS;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortState, setSortState] = useState<SortState>({
    field: "timestamp",
    direction: "desc", // Plus récent d'abord
  });

  const { activities, isLoading, error } = useRecentActivityWithDetails();

  // Helper pour extraire le texte localisé des métadonnées
  const getLocalizedText = (
    text: string | { en: string; fr: string } | undefined
  ): string | undefined => {
    if (!text) return undefined;
    if (typeof text === "string") return text;
    return text[currentLanguage] || text.fr || text.en;
  };

  const filteredAndSortedActivities = useMemo(() => {
    if (!activities) return [];

    const filtered = activities.filter((activity) => {
      const localizedTitle =
        getLocalizedText(activity.metadata?.title) || activity.displayName;
      return localizedTitle.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortState.field) {
        case "buildName":
          const titleA = getLocalizedText(a.metadata?.title) || a.displayName;
          const titleB = getLocalizedText(b.metadata?.title) || b.displayName;
          comparison = titleA.localeCompare(titleB);
          break;
        case "score":
          const scoreA = a.score || 0;
          const scoreB = b.score || 0;
          comparison = scoreA - scoreB;
          break;
        case "timestamp":
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          comparison = dateA - dateB;
          break;
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [activities, searchTerm, sortState, currentLanguage]);

  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedActivities.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedActivities, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(
    filteredAndSortedActivities.length / itemsPerPage
  );

  const handleSort = (field: SortField) => {
    setSortState((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleLaunchFormation = (activity: (typeof activities)[0]) => {
    const buildId = encodeURIComponent(activity.buildName);
    router.push(`/${activity.buildType}/${containerId}/${buildId}`);
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

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {t.recentActivity.errors.pleaseLogin}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {t.recentActivity.errors.loadingError} {error.message}
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
              <Calendar className="h-5 w-5" />
              {t.recentActivity.pageTitle}
            </CardTitle>
            <CardDescription>{t.recentActivity.subtitle}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.recentActivity.searchPlaceholder}
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
        {!isLoading && filteredAndSortedActivities.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {filteredAndSortedActivities.length}{" "}
            {filteredAndSortedActivities.length > 1
              ? t.recentActivity.stats.activitiesPlural
              : t.recentActivity.stats.activitiesSingular}
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
        ) : filteredAndSortedActivities.length > 0 ? (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>
                      <SortButton field="buildName">
                        {t.recentActivity.table.formation}
                      </SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="score">Score</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="timestamp">
                        {t.recentActivity.table.date}
                      </SortButton>
                    </TableHead>
                    <TableHead className="w-32">
                      {t.recentActivity.table.actions}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        {activity.imageUrl ? (
                          <Image
                            src={activity.imageUrl}
                            alt={
                              getLocalizedText(activity.metadata?.title) ||
                              activity.displayName
                            }
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
                            {getLocalizedText(activity.metadata?.title) ||
                              activity.displayName}
                          </div>
                          {activity.buildType === "wisetrainer" && (
                            <Badge variant="outline" className="text-xs">
                              {t.recentActivity.typeLabels.training}
                            </Badge>
                          )}
                          {activity.buildType === "wisetour" && (
                            <Badge variant="outline" className="text-xs">
                              {t.recentActivity.typeLabels.visit}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {activity.score !== undefined ? (
                          <div className="flex items-center gap-2">
                            {activity.score >= 80 && (
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            )}
                            <span
                              className={`font-medium ${
                                activity.score >= 80
                                  ? "text-green-600 dark:text-green-400"
                                  : activity.score >= 60
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {Math.round(activity.score)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {format(
                              new Date(activity.timestamp),
                              currentLanguage === "fr"
                                ? "d MMMM yyyy 'à' HH:mm"
                                : "MMMM d, yyyy 'at' HH:mm",
                              { locale: dateLocale }
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.timestamp), {
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
                          onClick={() => handleLaunchFormation(activity)}
                          className="flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          {t.recentActivity.relaunchButton}
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
                  {t.recentActivity.pagination.page} {currentPage}{" "}
                  {t.recentActivity.pagination.of} {totalPages} (
                  {filteredAndSortedActivities.length}{" "}
                  {filteredAndSortedActivities.length > 1
                    ? t.recentActivity.pagination.activitiesPlural
                    : t.recentActivity.pagination.activitiesSingular}
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
                    {t.recentActivity.pagination.previous}
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
                    {t.recentActivity.pagination.next}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground flex-1 flex flex-col justify-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {searchTerm
                ? `${t.recentActivity.empty.noResults} "${searchTerm}"`
                : t.recentActivity.empty.noActivity}
            </p>
            {!searchTerm && (
              <p className="text-sm mt-1">
                {t.recentActivity.empty.getStarted}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
