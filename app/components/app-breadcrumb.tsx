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
		"/tableau-de-bord": t.navigation.dashboard,
		"/tableau-de-bord/certifications": t.navigation.certifications,
		"/organisation": t.navigation.organization,
		"/organisation/membres": t.navigation.members,
		"/organisation/parametres": t.navigation.settings,
		"/organisation/tableau-de-bord": t.navigation.dashboard,
		"/wisetour": t.navigation.wisetour,
		"/wisetrainer": t.navigation.wisetrainer,
		"/organisation/plan-de-formation": t.navigation.trainingPlan,
		"/wisetrainer/formations-terminees": t.navigation.completedTrainings,
	});

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

		// Ajouter chaque segment du path
		segments.forEach((segment, index) => {
			const path = "/" + segments.slice(0, index + 1).join("/");
			const label =
				(routeLabels as Record<string, string>)[path] ||
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
