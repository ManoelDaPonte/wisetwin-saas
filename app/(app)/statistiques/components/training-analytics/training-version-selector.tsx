"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TrainingVersionSelectorProps {
  versions: string[];
  selectedVersion: string;
  onVersionChange: (version: string) => void;
}

export function TrainingVersionSelector({
  versions,
  selectedVersion,
  onVersionChange,
}: TrainingVersionSelectorProps) {
  if (versions.length <= 1) {
    return null; // Ne pas afficher si une seule version
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Version:</span>
      <Select value={selectedVersion} onValueChange={onVersionChange}>
        <SelectTrigger className="w-[150px] h-8">
          <SelectValue placeholder="Sélectionner" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((version) => (
            <SelectItem key={version} value={version}>
              {version}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
