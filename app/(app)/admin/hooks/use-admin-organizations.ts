import { useQuery } from "@tanstack/react-query";
import { AdminOrganization } from "@/lib/admin/organizations";

interface AdminOrganizationsResponse {
  organizations: AdminOrganization[];
  total: number;
  requestedBy: string;
}

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