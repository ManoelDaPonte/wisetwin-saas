"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2, Calendar, AlertCircle } from "lucide-react";
import { UpdateTrainingTagInputSchema, UpdateTrainingTagInputData } from "@/validators/training";
import { TrainingTag } from "@/types/training";
import { TagBadge } from "./tag-badge";
import { format } from "date-fns";

interface EditTagDialogProps {
	tag: TrainingTag | null;
	onEditTag: (data: UpdateTrainingTagInputData) => void;
	onClose: () => void;
	isUpdating: boolean;
	updateError: Error | null;
}

// Couleurs prédéfinies pour les plans
const TAG_COLORS = [
	"#3B82F6", // Bleu
	"#10B981", // Vert
	"#F59E0B", // Orange
	"#EF4444", // Rouge
	"#8B5CF6", // Violet
	"#06B6D4", // Cyan
	"#F97316", // Orange foncé
	"#84CC16", // Vert clair
	"#EC4899", // Rose
	"#6B7280", // Gris
];

export function EditTagDialog({
	tag,
	onEditTag,
	onClose,
	isUpdating,
	updateError,
}: EditTagDialogProps) {
	const form = useForm({
		resolver: zodResolver(UpdateTrainingTagInputSchema),
		defaultValues: {
			name: "",
			color: "#3B82F6",
			description: "",
			dueDate: "",
			priority: "MEDIUM",
		},
	});

	// Remplir le formulaire avec les données du plan à éditer
	useEffect(() => {
		if (tag) {
			form.reset({
				name: tag.name || "",
				color: tag.color || "#3B82F6",
				description: tag.description || "",
				dueDate: tag.dueDate
					? format(new Date(tag.dueDate), "yyyy-MM-dd")
					: "",
				priority: tag.priority || "MEDIUM",
			});
		}
	}, [tag, form]);

	const watchedValues = form.watch();

	const onSubmit = async (data: UpdateTrainingTagInputData) => {
		try {
			onEditTag(data);
			onClose();
		} catch (error) {
			console.error(error);
		}
	};

	if (!tag) return null;

	return (
		<Dialog open={!!tag} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Modifier le plan de formation</DialogTitle>
					<DialogDescription>
						Modifiez les propriétés de ce plan de formation.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						{/* Nom du plan */}
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Nom du plan de formation
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Ex: Formation nouveaux employés"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Couleur */}
						<FormField
							control={form.control}
							name="color"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Couleur</FormLabel>
									<FormDescription>
										Choisissez une couleur pour identifier
										visuellement ce plan
									</FormDescription>
									<FormControl>
										<div className="space-y-3">
											{/* Couleurs prédéfinies */}
											<div className="flex flex-wrap gap-2">
												{TAG_COLORS.map((color) => (
													<button
														key={color}
														type="button"
														className={`w-8 h-8 rounded-full border-2 transition-all ${
															field.value ===
															color
																? "border-foreground scale-110"
																: "border-muted-foreground/20 hover:border-muted-foreground/40"
														}`}
														style={{
															backgroundColor:
																color,
														}}
														onClick={() =>
															field.onChange(
																color
															)
														}
													/>
												))}
											</div>
											{/* Input couleur personnalisée */}
											<div className="flex items-center gap-2">
												<Input
													type="color"
													value={field.value}
													onChange={(e) =>
														field.onChange(
															e.target.value
														)
													}
													className="w-12 h-8 p-1 border rounded cursor-pointer"
												/>
												<Input
													type="text"
													value={field.value}
													onChange={(e) =>
														field.onChange(
															e.target.value
														)
													}
													placeholder="#3B82F6"
													className="flex-1"
												/>
											</div>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Description */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Description (optionnel)
									</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Description du groupe de membres..."
											className="resize-none"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Configuration du plan de formation */}
						<div className="space-y-4 pt-4 border-t">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4" />
								<h4 className="text-sm font-medium">
									Configuration du plan de formation
								</h4>
							</div>

							<div className="grid grid-cols-2 gap-4">
								{/* Date limite */}
								<FormField
									control={form.control}
									name="dueDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Date limite (optionnel)
											</FormLabel>
											<FormControl>
												<Input 
													type="date" 
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Priorité */}
								<FormField
									control={form.control}
									name="priority"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Priorité</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Sélectionner la priorité" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="LOW">
														<div className="flex items-center gap-2">
															<div className="w-2 h-2 rounded-full bg-green-500" />
															Faible
														</div>
													</SelectItem>
													<SelectItem value="MEDIUM">
														<div className="flex items-center gap-2">
															<div className="w-2 h-2 rounded-full bg-yellow-500" />
															Moyenne
														</div>
													</SelectItem>
													<SelectItem value="HIGH">
														<div className="flex items-center gap-2">
															<div className="w-2 h-2 rounded-full bg-red-500" />
															Élevée
														</div>
													</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormDescription className="text-xs">
								<AlertCircle className="w-3 h-3 inline mr-1" />
								La date limite et la priorité s&apos;appliquent
								à toutes les formations assignées à ce plan
							</FormDescription>
						</div>

						{/* Aperçu du plan */}
						{watchedValues.name && (
							<div className="space-y-2">
								<FormLabel>Aperçu</FormLabel>
								<div className="p-3 border rounded-lg bg-muted/20">
									<TagBadge
										name={watchedValues.name}
										color={watchedValues.color}
									/>
								</div>
							</div>
						)}

						{/* Erreur */}
						{updateError && (
							<div className="text-sm text-destructive">
								{updateError.message}
							</div>
						)}

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={isUpdating}>
								{isUpdating && (
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								)}
								Modifier le plan
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
