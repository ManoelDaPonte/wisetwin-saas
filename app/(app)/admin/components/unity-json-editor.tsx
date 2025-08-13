// app/(app)/admin/components/unity-json-editor.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminFormation } from "@/lib/admin/formations";
import { XCircle } from "lucide-react";
import { toast } from "sonner";

interface UnityJsonEditorProps {
	data: any;
	onChange: (data: any) => void;
	formation: AdminFormation;
	onSave?: () => void;
	onCancel?: () => void;
}

export function UnityJsonEditor({
	data,
	onChange,
	formation,
	onSave,
	onCancel,
}: UnityJsonEditorProps) {
	const [jsonString, setJsonString] = useState("");
	const [isValid, setIsValid] = useState(true);
	const [validationError, setValidationError] = useState("");

	// Initialiser le JSON string
	useEffect(() => {
		try {
			setJsonString(JSON.stringify(data || {}, null, 2));
			setIsValid(true);
			setValidationError("");
		} catch (error) {
			setJsonString("{}");
			setIsValid(false);
			setValidationError("Erreur lors de l'initialisation");
		}
	}, [data]);

	// Valider et parser le JSON à chaque changement
	const handleJsonChange = (value: string) => {
		setJsonString(value);

		try {
			const parsed = JSON.parse(value);
			setIsValid(true);
			setValidationError("");
			onChange(parsed);
		} catch (error) {
			setIsValid(false);
			setValidationError(
				error instanceof Error ? error.message : "JSON invalide"
			);
		}
	};


	return (
		<Card>
			<CardHeader>
				<CardTitle>Section Unity - Configuration JSON</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Erreur de validation */}
				{!isValid && (
					<Alert variant="destructive">
						<XCircle className="h-4 w-4" />
						<AlertDescription>
							JSON invalide : {validationError}
						</AlertDescription>
					</Alert>
				)}

				{/* Éditeur JSON */}
				<textarea
					value={jsonString}
					onChange={(e) => handleJsonChange(e.target.value)}
					className={`w-full h-[500px] p-3 text-sm font-mono border rounded-md resize-y focus:ring-2 focus:ring-ring focus:border-ring ${
						isValid
							? "border-input bg-background"
							: "border-destructive bg-destructive/5"
					}`}
					placeholder='{"interactions": {}, "settings": {}}'
					spellCheck={false}
				/>

			</CardContent>
		</Card>
	);
}
