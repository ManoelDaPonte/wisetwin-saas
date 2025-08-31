import { useQuery } from "@tanstack/react-query";
import { AdminOrganizationsResponse } from "@/types";

async function fetchAdminOrganizations(): Promise<AdminOrganizationsResponse> {
  const response = await fetch("/api/admin/organizations");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des organisations");
  }

  return response.json();
}

export function useAdminOrganizations() {
  return useQuery({
    queryKey: ["admin-organizations"],
    queryFn: fetchAdminOrganizations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}