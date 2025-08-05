import { useOrganizationStore, useIsPersonalSpace } from "@/stores/organization-store"
import { useSession } from "next-auth/react"

export function useContainer() {
  const { activeOrganization } = useOrganizationStore()
  const isPersonalSpace = useIsPersonalSpace()
  const { data: session } = useSession()
  
  const containerId = isPersonalSpace 
    ? session?.user?.azureContainerId || null
    : activeOrganization?.azureContainerId || null
  
  return {
    containerId,
    isPersonalSpace,
    organizationId: activeOrganization?.id || null,
    isReady: !!containerId && !!session,
  }
}