"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Clock, CheckCircle } from "lucide-react";

interface TrainingOverviewProps {
  uniqueUsersCount: number;
  completedCount: number;
  averageScore: number;
  questionsCount: number;
  proceduresCount?: number;
  averageDuration?: number;
}

export function TrainingOverview({
  uniqueUsersCount,
  completedCount,
  averageScore,
  questionsCount,
  proceduresCount = 0,
  averageDuration = 0,
}: TrainingOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Vue d&apos;ensemble</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="text-xl font-bold">{uniqueUsersCount}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Complétées</p>
              <p className="text-xl font-bold">{completedCount}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Score moyen</p>
              <p className="text-xl font-bold">{Math.round(averageScore)}%</p>
            </div>
          </div>

          {averageDuration > 0 && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Durée moy.</p>
                <p className="text-xl font-bold">
                  {Math.round(averageDuration / 60)} min
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Questions</p>
              <p className="text-xl font-bold">{questionsCount}</p>
            </div>
          </div>

          {proceduresCount > 0 && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10">
                <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Procédures</p>
                <p className="text-xl font-bold">{proceduresCount}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
