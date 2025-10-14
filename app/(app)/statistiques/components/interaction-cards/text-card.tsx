"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Eye, Scroll } from "lucide-react";
import type {
  TextInteractionData,
  ResolvedInteraction,
} from "@/types/training";

interface TextCardProps {
  interaction: ResolvedInteraction;
}

export function TextCard({ interaction }: TextCardProps) {
  const textData = interaction.data as TextInteractionData;

  // Titre du contenu - utiliser resolvedData ou fallback sur la clé
  const title =
    interaction.resolvedData?.textTitle || textData.contentKey || "Contenu";
  const subtitle = interaction.resolvedData?.textSubtitle;

  return (
    <Card
      key={interaction.interactionId}
      className="border-green-500/30"
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <p className="font-medium">{title}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            <Clock className="h-3 w-3 inline mr-1" />
            {Math.round(interaction.duration)}s
          </span>
        </div>

        {/* Métriques de lecture */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Temps d&apos;affichage:</span>
            <span className="font-medium">
              {textData.timeDisplayed.toFixed(1)}s
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Scroll className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Défilement:</span>
            <span className="font-medium">{textData.scrollPercentage}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
