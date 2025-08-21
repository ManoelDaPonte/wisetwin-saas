import { useQuery } from "@tanstack/react-query";
import { AdminUser, AdminUsersResponse } from "@/types";

async function fetchAdminUsers(): Promise<AdminUsersResponse> {
  const response = await fetch("/api/admin/users");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des utilisateurs");
  }

  return response.json();
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}