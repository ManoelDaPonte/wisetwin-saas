"use client";

import { usePathname, useRouter } from "next/navigation";
import {
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Configuration des routes avec leurs labels français
const routeLabels: Record<string, string> = {
	"/accueil": "Accueil",
	"/tableau-de-bord": "Tableau de bord",
	"/tableau-de-bord/certifications": "Certifications",
	"/organisation": "Organisation",
	"/organisation/membres": "Membres",
	"/organisation/parametres": "Paramètres",
	"/organisation/tableau-de-bord": "Tableau de bord",
	"/wisetour": "Wisetour",
	"/wisetrainer": "WiseTrainer",
	"/organisation/plan-de-formation": "Plan de formation",
	"/wisetrainer/formations-terminees": "Formations terminées",
};

export function AppBreadcrumb() {
	const pathname = usePathname();
	const router = useRouter();

	// Générer le breadcrumb complet avec tout le path
	const getBreadcrumbs = () => {
		if (pathname === "/" || pathname === "/accueil") {
			return [{ label: "Accueil", path: "/accueil", isLast: true }];
		}

		const segments = pathname.split("/").filter(Boolean);
		const breadcrumbs = [];

		// Toujours commencer par Accueil
		breadcrumbs.push({ label: "Accueil", path: "/accueil", isLast: false });

		// Ajouter chaque segment du path
		segments.forEach((segment, index) => {
			const path = "/" + segments.slice(0, index + 1).join("/");
			const label =
				routeLabels[path] ||
				segment.charAt(0).toUpperCase() + segment.slice(1);
			const isLast = index === segments.length - 1;

			breadcrumbs.push({ label, path, isLast });
		});

		return breadcrumbs;
	};

	const breadcrumbs = getBreadcrumbs();

	return (
		<BreadcrumbList>
			{breadcrumbs.map((breadcrumb) => (
				<div key={breadcrumb.path} className="flex items-center">
					<BreadcrumbItem>
						{breadcrumb.isLast ? (
							<BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
						) : (
							<BreadcrumbLink
								className="cursor-pointer"
								onClick={(e) => {
									e.preventDefault();
									router.push(breadcrumb.path);
								}}
							>
								{breadcrumb.label}
							</BreadcrumbLink>
						)}
					</BreadcrumbItem>
					{!breadcrumb.isLast && <BreadcrumbSeparator />}
				</div>
			))}
		</BreadcrumbList>
	);
}
