"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/use-translations";
import {
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AppBreadcrumb() {
	const pathname = usePathname();
	const router = useRouter();
	const t = useTranslations();

	// Configuration des routes avec leurs labels traduits
	const getRouteLabels = () => ({
		"/accueil": t.navigation.home,
		"/tableau-de-bord": t.navigation.myDashboard,
		"/tableau-de-bord/certifications": t.navigation.myCertifications,
		"/tableau-de-bord/activite-recente": t.navigation.myActivity,
		"/organisation": t.navigation.organizationOverview,
		"/organisation/membres": t.navigation.members,
		"/organisation/parametres": t.navigation.settings,
		"/wisetour": t.navigation.wisetour,
		"/wisetrainer": t.navigation.wisetrainer,
		"/organisation/plan-de-formation": t.navigation.trainingPlans,
		"/organisation/statistiques": t.navigation.analytics,
		"/wisetrainer/formations-terminees": t.navigation.completedTrainings,
	});

	// Fonction pour détecter si un segment est un ID d'organisation
	const isOrganizationId = (segment: string) => {
		return segment.startsWith("org-");
	};

	// Générer le breadcrumb complet avec tout le path
	const getBreadcrumbs = () => {
		const routeLabels = getRouteLabels();
		
		if (pathname === "/" || pathname === "/accueil") {
			return [{ label: t.navigation.home, path: "/accueil", isLast: true }];
		}

		const segments = pathname.split("/").filter(Boolean);
		const breadcrumbs = [];

		// Toujours commencer par Accueil
		breadcrumbs.push({ label: t.navigation.home, path: "/accueil", isLast: false });

		// Filtrer les segments d'ID d'organisation mais garder les indices pour construire les paths
		const visibleSegments: Array<{ segment: string; originalIndex: number }> = [];
		segments.forEach((segment, index) => {
			if (!isOrganizationId(segment)) {
				visibleSegments.push({ segment, originalIndex: index });
			}
		});

		// Ajouter chaque segment visible du path
		visibleSegments.forEach((item, index) => {
			const path = "/" + segments.slice(0, item.originalIndex + 1).join("/");
			const label =
				(routeLabels as Record<string, string>)[path] ||
				item.segment.charAt(0).toUpperCase() + item.segment.slice(1);
			const isLast = index === visibleSegments.length - 1;

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
