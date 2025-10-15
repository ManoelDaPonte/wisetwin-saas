"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionAnalytics } from "./question-analytics";
import { ProcedureAnalytics } from "./procedure-analytics";
import type { QuestionStats, ProcedureStats, TrainingAnalytics } from "@/types/training";

interface QuestionDistributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingName: string;
  version: string;
  questions: QuestionStats[];
  procedures?: ProcedureStats[];
  sessions: TrainingAnalytics[];
}

export function QuestionDistributionModal({
  open,
  onOpenChange,
  trainingName,
  version,
  questions,
  procedures = [],
  sessions,
}: QuestionDistributionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Analyse détaillée : {trainingName}
          </DialogTitle>
          <DialogDescription>
            Version {version} • Distribution des réponses (première tentative)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[75vh] pr-4">
          <div className="space-y-6">
            {/* Questions avec distribution première tentative */}
            <QuestionAnalytics questions={questions} sessions={sessions} />

            {/* Procédures */}
            {procedures.length > 0 && (
              <ProcedureAnalytics procedures={procedures} sessions={sessions} />
            )}

            {questions.length === 0 && procedures.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Aucune donnée d&apos;interaction disponible
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
