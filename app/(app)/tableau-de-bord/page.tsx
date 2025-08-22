"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStats } from "@/app/hooks/use-user-stats";
import { useSession } from "next-auth/react";
import { useIsPersonalSpace, useOrganizationStore } from "@/stores/organization-store";
import {
  BookOpen,
  Calendar,
  Users,
  CheckCircle2,
  Play,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}


function RecentActivityItem({
  activity,
}: {
  activity: {
    id: string;
    type: "completion" | "start" | "progress";
    buildName: string;
    buildType: "wisetrainer" | "wisetour";
    timestamp: string;
    progress?: number;
  };
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case "completion":
        return CheckCircle2;
      case "start":
        return Play;
      default:
        return BookOpen;
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case "completion":
        return "a terminé";
      case "start":
        return "a commencé";
      default:
        return "a progressé dans";
    }
  };

  const Icon = getIcon(activity.type);

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <div
        className={`p-2 rounded-full ${
          activity.type === "completion"
            ? "bg-green-100 text-green-600"
            : activity.type === "start"
            ? "bg-blue-100 text-blue-600"
            : "bg-orange-100 text-orange-600"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm">
          Vous {getActionText(activity.type)}{" "}
          <span className="font-medium">{activity.buildName}</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {activity.buildType === "wisetrainer" ? "Formation" : "Visite"}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(activity.timestamp), {
              addSuffix: true,
              locale: fr,
            })}
          </p>
        </div>
      </div>
      {activity.progress !== undefined && (
        <div className="text-right">
          <div className="text-sm font-medium">{activity.progress}%</div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { activeOrganization } = useOrganizationStore();
  const isPersonalSpace = useIsPersonalSpace();
  const { stats, isLoading: isStatsLoading, error: statsError } = useUserStats();

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Veuillez vous connecter pour accéder à votre tableau de bord.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={session.user?.image || undefined} />
          <AvatarFallback className="text-lg">
            {session.user?.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            Bonjour, {session.user?.name?.split(" ")[0]} !
          </h1>
          <p className="text-muted-foreground">
            {isPersonalSpace ? (
              "Espace personnel"
            ) : (
              <>
                <Users className="inline h-4 w-4 mr-1" />
                {activeOrganization?.name}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          title="Formations terminées"
          value={stats?.totalFormationsCompleted || 0}
          description="Au total"
          icon={CheckCircle2}
          isLoading={isStatsLoading}
        />
        <StatsCard
          title="Formations démarrées"
          value={stats?.totalFormationsStarted || 0}
          description="En cours et terminées"
          icon={Play}
          isLoading={isStatsLoading}
        />
      </div>

      {/* Résumé par type */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              WiseTrainer (Formations)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats?.wisetrainerCompletions || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Formations terminées
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Wisetour (Visites)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats?.wisetourVisits || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Environnements visités
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isStatsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 5).map((activity) => (
                <RecentActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aucune activité récente. Commencez une formation !
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages d'erreur */}
      {statsError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">
              Une erreur est survenue lors du chargement des données. Veuillez
              rafraîchir la page.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 