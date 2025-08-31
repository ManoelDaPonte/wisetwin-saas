import { useQuery } from "@tanstack/react-query";
import { AdminFormationsResponse } from "@/types";

async function fetchAdminFormations(): Promise<AdminFormationsResponse> {
  const response = await fetch("/api/admin/formations");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des formations");
  }

  return response.json();
}

export function useAdminFormations() {
  return useQuery({
    queryKey: ["admin-formations"],
    queryFn: fetchAdminFormations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}