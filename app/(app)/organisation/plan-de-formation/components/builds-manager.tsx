"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  FileCode,
} from "lucide-react";
import { useBuildsWithTags, useBulkAssignBuildTags, useBulkRemoveBuildTags, createBuildId } from "../hooks/use-build-tags";
import { useTrainingTags } from "../hooks/use-training-tags";
import { TagBadge } from "./tag-badge";
import { BulkAssignBuildTagsData, BulkRemoveBuildTagsData } from "@/types/training";
import { BuildType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image"

interface BuildsManagerProps {
  organizationId: string;
}

export function BuildsManager({}: BuildsManagerProps) {
  const [search, setSearch] = useState("");
  const [selectedBuilds, setSelectedBuilds] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterByTag, setFilterByTag] = useState<string>("");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const {
    data: buildsWithTags,
    isLoading,
    isError,
    error,
    refetch,
  } = useBuildsWithTags();

  const { data: tagsResponse } = useTrainingTags();
  const assignTagsMutation = useBulkAssignBuildTags();
  const removeTagsMutation = useBulkRemoveBuildTags();

  const builds = buildsWithTags || [];
  const tags = tagsResponse?.tags || [];

  // Filtrage des builds (WiseTrainer uniquement)
  const filteredBuilds = builds.filter(build => {
    const matchesSearch = 
      build.name.toLowerCase().includes(search.toLowerCase());

    const matchesTag = !filterByTag || filterByTag === "all" || 
      build.tags.some(tag => tag.id === filterByTag);

    return matchesSearch && matchesTag;
  });

  // Gestion des sélections
  const toggleBuildSelection = (buildId: string) => {
    setSelectedBuilds(prev => 
      prev.includes(buildId) 
        ? prev.filter(id => id !== buildId)
        : [...prev, buildId]
    );
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Actions
  const handleBulkAssign = () => {
    if (selectedBuilds.length === 0 || selectedTags.length === 0) return;
    
    const data: BulkAssignBuildTagsData = {
      buildIds: selectedBuilds,
      tagIds: selectedTags,
    };
    
    assignTagsMutation.mutate(data, {
      onSuccess: () => {
        setShowAssignDialog(false);
        setSelectedBuilds([]);
        setSelectedTags([]);
      }
    });
  };

  const handleBulkRemove = () => {
    if (selectedBuilds.length === 0 || selectedTags.length === 0) return;
    
    const data: BulkRemoveBuildTagsData = {
      buildIds: selectedBuilds,
      tagIds: selectedTags,
    };
    
    removeTagsMutation.mutate(data, {
      onSuccess: () => {
        setShowRemoveDialog(false);
        setSelectedBuilds([]);
        setSelectedTags([]);
      }
    });
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground text-center mb-4">
            {error?.message || "Impossible de charger les formations"}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-4">
      {/* Tableau des formations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                Gestion des formations
              </CardTitle>
              <CardDescription>
                Assignez et gérez les plans de formation de vos contenus
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une formation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterByTag} onValueChange={setFilterByTag}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les plans</SelectItem>
                  {tags.map(tag => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={selectedBuilds.length === 0}>
                      <Plus className="w-4 h-4 mr-2" />
                      Assigner
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assigner aux plans</DialogTitle>
                      <DialogDescription>
                        Sélectionnez les plans à assigner aux {selectedBuilds.length} formation{selectedBuilds.length > 1 ? 's' : ''} sélectionnée{selectedBuilds.length > 1 ? 's' : ''}.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="text-sm font-medium">Plans disponibles :</div>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {tags.map(tag => (
                          <div key={tag.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag.id}`}
                              checked={selectedTags.includes(tag.id)}
                              onCheckedChange={() => toggleTagSelection(tag.id)}
                            />
                            <label htmlFor={`tag-${tag.id}`} className="flex-1 cursor-pointer">
                              <TagBadge 
                                name={tag.name} 
                                color={tag.color}
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                        Annuler
                      </Button>
                      <Button 
                        onClick={handleBulkAssign}
                        disabled={selectedTags.length === 0 || assignTagsMutation.isPending}
                      >
                        {assignTagsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Assigner
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" disabled={selectedBuilds.length === 0}>
                      <Minus className="w-4 h-4 mr-2" />
                      Retirer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Retirer des plans</DialogTitle>
                      <DialogDescription>
                        Sélectionnez les plans à retirer des {selectedBuilds.length} formation{selectedBuilds.length > 1 ? 's' : ''} sélectionnée{selectedBuilds.length > 1 ? 's' : ''}.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="text-sm font-medium">Plans à retirer :</div>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {tags.map(tag => (
                          <div key={tag.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`remove-tag-${tag.id}`}
                              checked={selectedTags.includes(tag.id)}
                              onCheckedChange={() => toggleTagSelection(tag.id)}
                            />
                            <label htmlFor={`remove-tag-${tag.id}`} className="flex-1 cursor-pointer">
                              <TagBadge 
                                name={tag.name} 
                                color={tag.color}
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
                        Annuler
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={handleBulkRemove}
                        disabled={selectedTags.length === 0 || removeTagsMutation.isPending}
                      >
                        {removeTagsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Retirer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Skeleton className="h-4 w-4" />
                    </TableHead>
                    <TableHead>Formation WiseTrainer</TableHead>
                    <TableHead>Plans assignés</TableHead>
                    <TableHead>Mise à jour</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-md" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-3 w-[150px]" />
                            <Skeleton className="h-3 w-[100px]" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : filteredBuilds.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                {search || filterByTag
                  ? "Aucune formation trouvée pour cette recherche"
                  : "Aucune formation WiseTrainer disponible"}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedBuilds.length === filteredBuilds.length && filteredBuilds.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBuilds(filteredBuilds.map(b => createBuildId(b.name, b.type.toLowerCase() as BuildType, b.containerId)));
                          } else {
                            setSelectedBuilds([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Formation WiseTrainer</TableHead>
                    <TableHead>Plans assignés</TableHead>
                    <TableHead>Mise à jour</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuilds.map((build) => {
                    const buildId = createBuildId(build.name, build.type.toLowerCase() as BuildType, build.containerId);
                    return (
                      <TableRow key={buildId}>
                        <TableCell>
                          <Checkbox
                            checked={selectedBuilds.includes(buildId)}
                            onCheckedChange={() => toggleBuildSelection(buildId)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
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
                            <div>
                              <div className="font-medium">
                                {build.metadata?.title && typeof build.metadata.title === "string"
                                  ? build.metadata.title
                                  : build.name}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
                                {build.metadata?.description && typeof build.metadata.description === "string"
                                  ? build.metadata.description
                                  : "Formation interactive WiseTrainer"}
                              </div>
                              {build.metadata?.objectives && 
                                Array.isArray(build.metadata.objectives) && 
                                build.metadata.objectives.length > 0 && (
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                  {build.metadata.objectives.length} objectif{build.metadata.objectives.length > 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {build.tags.length > 0 ? (
                              build.tags.map((tag) => (
                                <TagBadge
                                  key={tag.id}
                                  name={tag.name}
                                  color={tag.color}
                                  size="sm"
                                />
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground italic">
                                Aucun plan
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {build.updatedAt 
                              ? formatDistanceToNow(new Date(build.updatedAt), {
                                  addSuffix: true,
                                  locale: fr,
                                })
                              : 'Non spécifiée'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}