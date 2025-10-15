"use client";

import { Card } from "@/components/ui/card";
import { BookOpen, CheckCircle, AlertTriangle, Archive } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainingDashboard } from "../hooks/use-training-system";

export function TrainingPlanStats() {
  const { dashboardMetrics, isLoading } = useTrainingDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden p-0">
        <div className="flex h-full min-h-28">
          <div className="flex items-center justify-center bg-primary w-20 flex-shrink-0">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
            <div className="text-3xl font-bold text-primary">
              {dashboardMetrics?.activePlans || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Plans actifs</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex h-full min-h-28">
          <div className="flex items-center justify-center bg-primary w-20 flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
            <div className="text-3xl font-bold text-primary">
              {dashboardMetrics?.completedPlans || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Plans terminés</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex h-full min-h-28">
          <div className="flex items-center justify-center bg-primary w-20 flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
            <div className="text-3xl font-bold text-primary">
              {dashboardMetrics?.overduePlans || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Plans en retard</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex h-full min-h-28">
          <div className="flex items-center justify-center bg-primary w-20 flex-shrink-0">
            <Archive className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
            <div className="text-3xl font-bold text-primary">
              {dashboardMetrics?.archivedTags || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Plans archivés</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
