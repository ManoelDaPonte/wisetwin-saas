"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/stores/organization-store";
import { useContainer } from "@/app/hooks/use-container";

export function PrefetchProvider({ children }: { children: React.ReactNode }) {
	const queryClient = useQueryClient();
	const { activeOrganization } = useOrganizationStore();
	const { containerId } = useContainer();

	useEffect(() => {
		console.log(
			"PrefetchProvider - activeOrganization changed:",
			activeOrganization
		);
		console.log("PrefetchProvider - containerId:", containerId);

		// Si on est dans l'espace personnel (activeOrganization === null), on ne précharge rien
		if (!activeOrganization || !containerId) {
			console.log(
				"PrefetchProvider - Skipping prefetch (no org or no containerId)"
			);
			return;
		}

		const prefetchData = async () => {
			console.log(
				"PrefetchProvider - Starting prefetch for org:",
				activeOrganization.name
			);

			try {
				await Promise.all([
					// Prefetch members pour l'organisation active
					queryClient.prefetchQuery({
						queryKey: ["members", activeOrganization.id],
						queryFn: async () => {
							console.log(
								"Prefetching members for org:",
								activeOrganization.id
							);
							const res = await fetch(
								`/api/members?organizationId=${activeOrganization.id}`
							);
							if (!res.ok)
								throw new Error("Failed to fetch members");
							return res.json();
						},
						staleTime: 5 * 60 * 1000,
					}),

					// Prefetch wisetour builds
					queryClient.prefetchQuery({
						queryKey: ["builds", containerId, "wisetour"],
						queryFn: async () => {
							console.log(
								"Prefetching wisetour builds for container:",
								containerId
							);
							const res = await fetch(
								`/api/builds?containerId=${containerId}&type=wisetour`
							);
							if (!res.ok)
								throw new Error("Failed to fetch builds");
							return res.json();
						},
						staleTime: 5 * 60 * 1000,
					}),

					// Prefetch wisetrainer builds
					queryClient.prefetchQuery({
						queryKey: ["builds", containerId, "wisetrainer"],
						queryFn: async () => {
							console.log(
								"Prefetching wisetrainer builds for container:",
								containerId
							);
							const res = await fetch(
								`/api/builds?containerId=${containerId}&type=wisetrainer`
							);
							if (!res.ok)
								throw new Error("Failed to fetch builds");
							return res.json();
						},
						staleTime: 5 * 60 * 1000,
					}),
				]);

				console.log(
					`✅ Données préchargées pour l'organisation: ${activeOrganization.name}`
				);
			} catch (error) {
				console.error("❌ Error prefetching data:", error);
			}
		};

		prefetchData();
	}, [activeOrganization?.id, containerId, queryClient]);

	return <>{children}</>;
}
