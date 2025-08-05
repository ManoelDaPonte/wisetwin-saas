import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/stores/organization-store";
import { useContainer } from "./use-container";

interface PrefetchStrategy {
	[key: string]: {
		wisetourBuilds?: boolean;
		wisetrainerBuilds?: boolean;
		members?: boolean;
		followedBuilds?: boolean;
	};
}

// Stratégies de prefetch par route
const PREFETCH_STRATEGIES: PrefetchStrategy = {
	"/wisetour": {
		wisetourBuilds: true,
		followedBuilds: true,
	},
	"/wisetrainer": {
		wisetrainerBuilds: true,
		followedBuilds: true,
	},
	"/organisation": {
		members: true,
	},
	"/organisation/membres": {
		members: true,
	},
	"/organisation/tableau-de-bord": {
		members: true,
		wisetourBuilds: true,
		wisetrainerBuilds: true,
	},
	"/tableau-de-bord": {
		followedBuilds: true,
	},
	"/accueil": {
		wisetourBuilds: true,
		wisetrainerBuilds: true,
		members: true,
	},
};

export function useHoverPrefetch() {
	const queryClient = useQueryClient();
	const { activeOrganization } = useOrganizationStore();
	const { containerId, isReady } = useContainer();

	const prefetchForRoute = useCallback(
		async (url: string) => {
			console.log("🚀 Prefetch attempt for:", url, { isReady, containerId, activeOrganization: activeOrganization?.name });
			
			if (!isReady) {
				console.log("❌ Not ready, skipping prefetch");
				return;
			}

			const strategy = PREFETCH_STRATEGIES[url];
			if (!strategy) {
				console.log("❌ No strategy found for:", url);
				return;
			}
			
			console.log("✅ Strategy found:", strategy);

			const prefetchPromises: Promise<any>[] = [];

			// Prefetch members
			if (strategy.members && activeOrganization) {
				prefetchPromises.push(
					queryClient.prefetchQuery({
						queryKey: ["members", activeOrganization.id],
						queryFn: async () => {
							const res = await fetch(
								`/api/members?organizationId=${activeOrganization.id}`
							);
							if (!res.ok) throw new Error("Failed to fetch members");
							return res.json();
						},
						staleTime: 5 * 60 * 1000,
					})
				);
			}

			// Prefetch wisetour builds
			if (strategy.wisetourBuilds && containerId) {
				prefetchPromises.push(
					queryClient.prefetchQuery({
						queryKey: ["builds", containerId, "wisetour"],
						queryFn: async () => {
							const res = await fetch(
								`/api/builds?containerId=${containerId}&type=wisetour`
							);
							if (!res.ok) throw new Error("Failed to fetch builds");
							return res.json();
						},
						staleTime: 5 * 60 * 1000,
					})
				);
			}

			// Prefetch wisetrainer builds
			if (strategy.wisetrainerBuilds && containerId) {
				prefetchPromises.push(
					queryClient.prefetchQuery({
						queryKey: ["builds", containerId, "wisetrainer"],
						queryFn: async () => {
							const res = await fetch(
								`/api/builds?containerId=${containerId}&type=wisetrainer`
							);
							if (!res.ok) throw new Error("Failed to fetch builds");
							return res.json();
						},
						staleTime: 5 * 60 * 1000,
					})
				);
			}

			// Prefetch followed builds
			if (strategy.followedBuilds && containerId) {
				prefetchPromises.push(
					queryClient.prefetchQuery({
						queryKey: ["builds", containerId, "wisetour", { followedOnly: true }],
						queryFn: async () => {
							const res = await fetch(
								`/api/builds?containerId=${containerId}&type=wisetour&followedOnly=true`
							);
							if (!res.ok) throw new Error("Failed to fetch builds");
							return res.json();
						},
						staleTime: 5 * 60 * 1000,
					}),
					queryClient.prefetchQuery({
						queryKey: ["builds", containerId, "wisetrainer", { followedOnly: true }],
						queryFn: async () => {
							const res = await fetch(
								`/api/builds?containerId=${containerId}&type=wisetrainer&followedOnly=true`
							);
							if (!res.ok) throw new Error("Failed to fetch builds");
							return res.json();
						},
						staleTime: 5 * 60 * 1000,
					})
				);
			}

			// Exécuter tous les prefetch en parallèle
			if (prefetchPromises.length > 0) {
				console.log(`🔄 Starting ${prefetchPromises.length} prefetch operations...`);
				try {
					await Promise.allSettled(prefetchPromises);
					console.log("✅ Prefetch completed for:", url);
				} catch (error) {
					console.error("❌ Prefetch failed:", error);
				}
			} else {
				console.log("⚠️ No prefetch operations to perform");
			}
		},
		[activeOrganization, containerId, isReady, queryClient]
	);

	// Debounced prefetch pour éviter les appels multiples
	const handleHover = useCallback(
		(url: string) => {
			console.log("👆 Hover detected on:", url);
			const timer = setTimeout(() => {
				prefetchForRoute(url);
			}, 50); // 50ms de délai réduit

			return () => clearTimeout(timer);
		},
		[prefetchForRoute]
	);

	return { handleHover };
}