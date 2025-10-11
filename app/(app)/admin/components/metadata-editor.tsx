// app/(app)/admin/components/metadata-editor.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	FormationMetadata,
	FormationMetadataSchema,
} from "@/lib/admin/metadata";
import { AdminFormation } from "@/lib/admin/formations";
import { useFormationMetadata } from "../hooks/use-formation-metadata";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Plus, X, Code, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UnityJsonEditor } from "./unity-json-editor";

interface MetadataEditorProps {
	formation: AdminFormation;
	initialMetadata: FormationMetadata;
	onSaveSuccess?: () => void;
}

export function MetadataEditor({
	formation,
	initialMetadata,
	onSaveSuccess,
}: MetadataEditorProps) {
	const [tags, setTags] = useState<string[]>(initialMetadata.tags || []);
	const [prerequisites, setPrerequisites] = useState<string[]>(
		initialMetadata.prerequisites || []
	);
	const [newTag, setNewTag] = useState("");
	const [newPrerequisite, setNewPrerequisite] = useState("");
	const [unityData, setUnityData] = useState<Record<string, unknown>>(
		initialMetadata.unity || {}
	);

	const { saveMetadata, isSaving, saveError, saveSuccess } =
		useFormationMetadata({
			containerId: formation.containerId,
			buildType: formation.buildType,
			buildName: formation.name,
		});

	// Mettre à jour unityData quand initialMetadata change
	useEffect(() => {
		if (initialMetadata.unity !== undefined) {
			setUnityData(initialMetadata.unity);
		}
	}, [initialMetadata]);

	const form = useForm({
		resolver: zodResolver(FormationMetadataSchema),
		defaultValues: {
			...initialMetadata,
			updatedAt: new Date().toISOString(),
		},
	});

	const onSubmit = async (data: Record<string, unknown>) => {
		const metadataToSave: FormationMetadata = {
			...data,
			tags,
			prerequisites,
			unity: unityData, // Inclure les données Unity
			updatedAt: new Date().toISOString(),
		} as FormationMetadata;

		try {
			await saveMetadata(metadataToSave);
		} catch (error) {
			console.error("Erreur sauvegarde:", error);
		}
	};

	// Handle success
	if (saveSuccess) {
		toast.success("Métadonnées sauvegardées avec succès !");
		onSaveSuccess?.();
	}

	// Handle save error
	if (saveError) {
		toast.error(`Erreur: ${saveError.message}`);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<Tabs defaultValue="general" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger
							value="general"
							className="flex items-center gap-2"
						>
							<FileText className="h-4 w-4" />
							Général
						</TabsTrigger>
						<TabsTrigger
							value="unity"
							className="flex items-center gap-2"
						>
							<Code className="h-4 w-4" />
							Unity
						</TabsTrigger>
					</TabsList>

					<TabsContent value="general" className="space-y-6">
						{/* Contenu de l'onglet Général */}
						<Card>
							<CardHeader>
								<CardTitle>Informations générales</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="id"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Identifiant
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														disabled
													/>
												</FormControl>
												<FormDescription>
													Identifiant unique généré
													automatiquement
												</FormDescription>
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="version"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Version</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="1.0.0"
													/>
												</FormControl>
												<FormDescription>
													Format: x.y.z (ex: 1.2.3)
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="title"
									render={({ field }) => {
										// Détecter si c'est un objet multilingue
										const isMultilingual = typeof field.value === 'object' && field.value !== null && 'en' in field.value && 'fr' in field.value;

										if (isMultilingual) {
											const multiValue = field.value as { en: string; fr: string };
											return (
												<FormItem>
													<FormLabel>Titre de la formation (Multilingue)</FormLabel>
													<div className="space-y-2">
														<div>
															<label className="text-xs text-muted-foreground">🇬🇧 Anglais</label>
															<FormControl>
																<Input
																	value={multiValue.en || ''}
																	onChange={(e) => field.onChange({ ...multiValue, en: e.target.value })}
																	placeholder="English title"
																/>
															</FormControl>
														</div>
														<div>
															<label className="text-xs text-muted-foreground">🇫🇷 Français</label>
															<FormControl>
																<Input
																	value={multiValue.fr || ''}
																	onChange={(e) => field.onChange({ ...multiValue, fr: e.target.value })}
																	placeholder="Titre français"
																/>
															</FormControl>
														</div>
													</div>
													<FormMessage />
												</FormItem>
											);
										}

										// Format string simple
										return (
											<FormItem>
												<FormLabel>Titre de la formation</FormLabel>
												<FormControl>
													<Input {...field} value={field.value as string || ''} />
												</FormControl>
												<FormMessage />
											</FormItem>
										);
									}}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => {
										// Détecter si c'est un objet multilingue
										const isMultilingual = typeof field.value === 'object' && field.value !== null && 'en' in field.value && 'fr' in field.value;

										if (isMultilingual) {
											const multiValue = field.value as { en: string; fr: string };
											return (
												<FormItem>
													<FormLabel>Description (Multilingue)</FormLabel>
													<FormDescription>
														Description détaillée de la formation en anglais et français
													</FormDescription>
													<div className="space-y-2">
														<div>
															<label className="text-xs text-muted-foreground">🇬🇧 Anglais</label>
															<FormControl>
																<Textarea
																	value={multiValue.en || ''}
																	onChange={(e) => field.onChange({ ...multiValue, en: e.target.value })}
																	placeholder="English description"
																	rows={3}
																/>
															</FormControl>
														</div>
														<div>
															<label className="text-xs text-muted-foreground">🇫🇷 Français</label>
															<FormControl>
																<Textarea
																	value={multiValue.fr || ''}
																	onChange={(e) => field.onChange({ ...multiValue, fr: e.target.value })}
																	placeholder="Description française"
																	rows={3}
																/>
															</FormControl>
														</div>
													</div>
													<FormMessage />
												</FormItem>
											);
										}

										// Format string simple
										return (
											<FormItem>
												<FormLabel>Description</FormLabel>
												<FormControl>
													<Textarea {...field} value={field.value as string || ''} rows={3} />
												</FormControl>
												<FormDescription>
													Description détaillée de la formation (min. 10 caractères)
												</FormDescription>
												<FormMessage />
											</FormItem>
										);
									}}
								/>

								<div className="grid grid-cols-3 gap-4">
									<FormField
										control={form.control}
										name="category"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Catégorie</FormLabel>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="Débutant">
															Débutant
														</SelectItem>
														<SelectItem value="Intermédiaire">
															Intermédiaire
														</SelectItem>
														<SelectItem value="Avancé">
															Avancé
														</SelectItem>
														<SelectItem value="Expert">
															Expert
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="difficulty"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Difficulté
												</FormLabel>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="Très facile">
															Très facile
														</SelectItem>
														<SelectItem value="Facile">
															Facile
														</SelectItem>
														<SelectItem value="Moyen">
															Moyen
														</SelectItem>
														<SelectItem value="Difficile">
															Difficile
														</SelectItem>
														<SelectItem value="Très difficile">
															Très difficile
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="duration"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Durée estimée
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="30 minutes"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Section Tags */}
								<div className="space-y-3">
									<FormLabel>Tags</FormLabel>
									<div className="flex flex-wrap gap-2 mb-2">
										{tags.map((tag, index) => (
											<Badge
												key={index}
												variant="secondary"
												className="gap-1"
											>
												{tag}
												<button
													type="button"
													onClick={() =>
														setTags(
															tags.filter(
																(_, i) =>
																	i !== index
															)
														)
													}
													className="ml-1 hover:text-destructive"
												>
													<X className="h-3 w-3" />
												</button>
											</Badge>
										))}
									</div>
									<div className="flex gap-2">
										<Input
											value={newTag}
											onChange={(e) =>
												setNewTag(e.target.value)
											}
											placeholder="Nouveau tag"
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													if (newTag.trim()) {
														setTags([
															...tags,
															newTag.trim(),
														]);
														setNewTag("");
													}
												}
											}}
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => {
												if (newTag.trim()) {
													setTags([
														...tags,
														newTag.trim(),
													]);
													setNewTag("");
												}
											}}
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								</div>

								{/* Section Prérequis */}
								<div className="space-y-3">
									<FormLabel>Prérequis</FormLabel>
									<div className="space-y-2">
										{prerequisites.map(
											(prerequisite, index) => (
												<div
													key={index}
													className="flex items-center gap-2"
												>
													<div className="flex-1 text-sm p-2 bg-muted rounded">
														{prerequisite}
													</div>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() =>
															setPrerequisites(
																prerequisites.filter(
																	(_, i) =>
																		i !==
																		index
																)
															)
														}
													>
														<X className="h-4 w-4" />
													</Button>
												</div>
											)
										)}
									</div>
									<div className="flex gap-2">
										<Input
											value={newPrerequisite}
											onChange={(e) =>
												setNewPrerequisite(
													e.target.value
												)
											}
											placeholder="Nouveau prérequis"
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													if (
														newPrerequisite.trim()
													) {
														setPrerequisites([
															...prerequisites,
															newPrerequisite.trim(),
														]);
														setNewPrerequisite("");
													}
												}
											}}
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => {
												if (newPrerequisite.trim()) {
													setPrerequisites([
														...prerequisites,
														newPrerequisite.trim(),
													]);
													setNewPrerequisite("");
												}
											}}
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="unity" className="space-y-6">
						<UnityJsonEditor
							data={unityData}
							onChange={setUnityData}
						/>
					</TabsContent>
				</Tabs>

				<Separator />

				<div className="flex justify-end gap-3">
					<Button type="submit" disabled={isSaving} className="gap-2">
						{isSaving ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Save className="h-4 w-4" />
						)}
						Sauvegarder
					</Button>
				</div>
			</form>
		</Form>
	);
}
