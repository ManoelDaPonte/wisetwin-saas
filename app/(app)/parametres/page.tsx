"use client";

import { ProfilSection } from "./components/profil-section";
import { ApparenceSection } from "./components/apparence-section";
import { CompteSection } from "./components/compte-section";
import { ZoneDangereuseSection } from "./components/zone-dangereuse-section";

export default function ParametresPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="container max-w-4xl py-8 space-y-8">
				<div>
					<h1 className="text-3xl font-bold">Paramètres</h1>
					<p className="text-muted-foreground">
						Gérez vos préférences et paramètres de compte
					</p>
				</div>

				<ProfilSection />
				<ApparenceSection />
				<CompteSection />
				<ZoneDangereuseSection />
			</div>
		</div>
	);
}
