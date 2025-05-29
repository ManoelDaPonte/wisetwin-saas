import { useState, useCallback } from "react"
import { useOrganizationStore } from "@/app/stores/organization-store"

export function useOrganizations() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setOrganizations } = useOrganizationStore()

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/organizations")
      if (!response.ok) throw new Error("Failed to fetch organizations")
      
      const data = await response.json()
      setOrganizations(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      console.error("Error fetching organizations:", err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [setOrganizations])

  const createOrganization = useCallback(async (name: string, description: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to create organization")
      }

      const newOrg = await response.json()
      const updatedOrgs = await fetchOrganizations() // Refresh the list
      // Return the organization from the updated list to ensure consistency
      const createdOrg = updatedOrgs.find((org: any) => org.id === newOrg.id) || newOrg
      return createdOrg
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create organization"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchOrganizations])

  return {
    fetchOrganizations,
    createOrganization,
    isLoading,
    error,
  }
}