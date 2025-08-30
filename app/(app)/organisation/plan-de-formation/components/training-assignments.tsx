"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  BookOpen,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  BarChart3,
  Play,
} from "lucide-react";
import { useBuildsWithTags, useBulkAssignBuildTags, useBulkRemoveBuildTags, createBuildId } from "../hooks/use-build-tags";
import { useTrainingTags } from "../hooks/use-training-tags";
import { TagBadge } from "./tag-badge";
import { BuildWithTags, BulkAssignBuildTagsData, BulkRemoveBuildTagsData } from "@/types/training";
import { BuildType } from "@/types";

interface TrainingAssignmentsProps {
  organizationId: string;
}

export function TrainingAssignments({ organizationId }: TrainingAssignmentsProps) {
  const [search, setSearch] = useState("");
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [filterByTag, setFilterByTag] = useState<string>("");
  const [filterByStatus, setFilterByStatus] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TrainingAssignment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState<TrainingAssignment | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateTrainingAssignmentData>({
    tagId: "",
    unityBuildId: "",
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM",
    status: "ACTIVE",
  });

  const {
    data: assignmentsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useTrainingAssignments({
    ...(filterByTag && filterByTag !== "all" && { tagId: filterByTag }),
    ...(filterByStatus && filterByStatus !== "all" && { status: filterByStatus }),
  });

  const { data: tagsResponse } = useTrainingTags();
  const createMutation = useCreateTrainingAssignment();
  const updateMutation = useUpdateTrainingAssignment();
  const deleteMutation = useDeleteTrainingAssignment();

  const assignments = assignmentsResponse?.assignments || [];
  const tags = tagsResponse?.tags || [];

  // Filtrage des assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(search.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(search.toLowerCase()) ||
      assignment.tag.name.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  // Gestion des sélections
  const toggleAssignmentSelection = (assignmentId: string) => {
    setSelectedAssignments(prev => 
      prev.includes(assignmentId) 
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  const selectAllAssignments = () => {
    setSelectedAssignments(filteredAssignments.map(a => a.id));
  };

  const clearAssignmentSelection = () => {
    setSelectedAssignments([]);
  };

  // Actions
  const handleCreate = () => {
    if (!formData.tagId || !formData.title) return;
    
    createMutation.mutate(formData, {
      onSuccess: () => {
        setShowCreateDialog(false);
        setFormData({
          tagId: "",
          unityBuildId: "",
          title: "",
          description: "",
          dueDate: "",
          priority: "MEDIUM",
          status: "ACTIVE",
        });
      },
    });
  };

  const handleEdit = () => {
    if (!editingAssignment) return;
    
    const updateData: UpdateTrainingAssignmentData = {
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate || null,
      priority: formData.priority,
      status: formData.status,
      ...(formData.unityBuildId && { unityBuildId: formData.unityBuildId }),
    };

    updateMutation.mutate({
      assignmentId: editingAssignment.id,
      data: updateData,
    }, {
      onSuccess: () => {
        setShowEditDialog(false);
        setEditingAssignment(null);
        setFormData({
          tagId: "",
          unityBuildId: "",
          title: "",
          description: "",
          dueDate: "",
          priority: "MEDIUM",
          status: "ACTIVE",
        });
      },
    });
  };

  const handleDelete = () => {
    if (!deletingAssignment) return;
    
    deleteMutation.mutate(deletingAssignment.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setDeletingAssignment(null);
      },
    });
  };

  const openEditDialog = (assignment: TrainingAssignment) => {
    setEditingAssignment(assignment);
    setFormData({
      tagId: assignment.tagId,
      unityBuildId: assignment.unityBuildId || "",
      title: assignment.title,
      description: assignment.description || "",
      dueDate: assignment.dueDate ? format(new Date(assignment.dueDate), "yyyy-MM-dd") : "",
      priority: assignment.priority,
      status: assignment.status,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (assignment: TrainingAssignment) => {
    setDeletingAssignment(assignment);
    setShowDeleteDialog(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-500";
      case "MEDIUM": return "bg-yellow-500";
      case "LOW": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "default";
      case "PAUSED": return "secondary";
      case "ARCHIVED": return "outline";
      default: return "outline";
    }
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground text-center mb-4">
            {(error as Error)?.message || "Impossible de charger les assignments"}
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
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Formations par Tag</h3>
          <p className="text-sm text-muted-foreground">
            Assignez des formations Unity aux tags de collaborateurs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {assignments.length} assignment{assignments.length > 1 ? 's' : ''}
          </Badge>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle formation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Assigner une formation à un tag</DialogTitle>
                <DialogDescription>
                  Créez un nouvel assignment de formation pour un tag de collaborateurs.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tag *</Label>
                    <Select value={formData.tagId} onValueChange={(value) => setFormData({...formData, tagId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un tag" />
                      </SelectTrigger>
                      <SelectContent>
                        {tags.map(tag => (
                          <SelectItem key={tag.id} value={tag.id}>
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.name}
                              <Badge variant="outline" className="ml-2 text-xs">
                                {tag._count?.memberTags || 0} membres
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Build Unity</Label>
                    <Input
                      placeholder="ID du build Unity (optionnel)"
                      value={formData.unityBuildId}
                      onChange={(e) => setFormData({...formData, unityBuildId: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Titre de la formation *</Label>
                  <Input
                    placeholder="Ex: Formation WiseTour - Module Sécurité"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Description détaillée de la formation..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date limite</Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Priorité</Label>
                    <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Faible</SelectItem>
                        <SelectItem value="MEDIUM">Moyenne</SelectItem>
                        <SelectItem value="HIGH">Élevée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="PAUSED">En pause</SelectItem>
                        <SelectItem value="ARCHIVED">Archivée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={!formData.tagId || !formData.title || createMutation.isPending}
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Créer l'assignment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une formation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterByTag} onValueChange={setFilterByTag}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrer par tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les tags</SelectItem>
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

        <Select value={filterByStatus} onValueChange={setFilterByStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="ACTIVE">Actives</SelectItem>
            <SelectItem value="PAUSED">En pause</SelectItem>
            <SelectItem value="ARCHIVED">Archivées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tableau des assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formations assignées</CardTitle>
          <CardDescription>
            Gérez les formations assignées aux différents tags de votre organisation
          </CardDescription>
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
                    <TableHead>Formation</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-2 w-full rounded-full" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 rounded" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                {search || filterByTag || filterByStatus ? "Aucune formation trouvée avec ces filtres" : "Aucune formation assignée"}
              </div>
              {!search && !filterByTag && !filterByStatus && (
                <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer votre première formation
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedAssignments.length === filteredAssignments.length && filteredAssignments.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            selectAllAssignments();
                          } else {
                            clearAssignmentSelection();
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Formation</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Date limite</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedAssignments.includes(assignment.id)}
                          onCheckedChange={() => toggleAssignmentSelection(assignment.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{assignment.title}</div>
                          {assignment.description && (
                            <div className="text-xs text-muted-foreground max-w-xs truncate">
                              {assignment.description}
                            </div>
                          )}
                          {assignment.unityBuildId && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <BookOpen className="w-3 h-3" />
                              Build: {assignment.unityBuildId.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <TagBadge
                          name={assignment.tag.name}
                          color={assignment.tag.color}
                          showCount={assignment.tag._count?.memberTags}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(assignment.status) as any}>
                          {assignment.status === "ACTIVE" && "Active"}
                          {assignment.status === "PAUSED" && "En pause"}
                          {assignment.status === "ARCHIVED" && "Archivée"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span 
                            className={`w-2 h-2 rounded-full ${getPriorityColor(assignment.priority)}`}
                          />
                          <span className="text-sm">
                            {assignment.priority === "HIGH" && "Élevée"}
                            {assignment.priority === "MEDIUM" && "Moyenne"}
                            {assignment.priority === "LOW" && "Faible"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.dueDate ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(assignment.dueDate), "dd/MM/yyyy", { locale: fr })}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <BarChart3 className="w-3 h-3" />
                          {assignment._count?.completions || 0}/{assignment.tag._count?.memberTags || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(assignment)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openDeleteDialog(assignment)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer l'assignment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer l'assignment "{assignment.title}" ?
                                  Cette action supprimera également toutes les progressions associées.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'assignment</DialogTitle>
            <DialogDescription>
              Modifiez les détails de cet assignment de formation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tag</Label>
                <div className="p-2 bg-muted rounded">
                  {editingAssignment && (
                    <TagBadge
                      name={editingAssignment.tag.name}
                      color={editingAssignment.tag.color}
                      showCount={editingAssignment.tag._count?.memberTags}
                    />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Build Unity</Label>
                <Input
                  placeholder="ID du build Unity (optionnel)"
                  value={formData.unityBuildId}
                  onChange={(e) => setFormData({...formData, unityBuildId: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Titre de la formation *</Label>
              <Input
                placeholder="Ex: Formation WiseTour - Module Sécurité"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Description détaillée de la formation..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date limite</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Faible</SelectItem>
                    <SelectItem value="MEDIUM">Moyenne</SelectItem>
                    <SelectItem value="HIGH">Élevée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PAUSED">En pause</SelectItem>
                    <SelectItem value="ARCHIVED">Archivée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleEdit}
              disabled={!formData.title || updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}