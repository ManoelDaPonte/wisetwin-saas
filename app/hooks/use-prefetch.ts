"use client"

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useOrganizationStore } from "@/app/stores/organization-store"
import { useSession } from "next-auth/react"

export function usePrefetchOrganizationData() {
  const queryClient = useQueryClient()
  const { activeOrganization } = useOrganizationStore()
  const { data: session } = useSession()

  const prefetchMembers = useCallback(() => {
    if (activeOrganization?.id) {
      return queryClient.prefetchQuery({
        queryKey: ["members", activeOrganization.id],
        queryFn: async () => {
          const res = await fetch(`/api/members?organizationId=${activeOrganization.id}`)
          if (!res.ok) throw new Error("Failed to fetch members")
          return res.json()
        },
        staleTime: 5 * 60 * 1000,
      })
    }
  }, [queryClient, activeOrganization?.id])

  const prefetchBuilds = useCallback((buildType: 'wisetour' | 'wisetrainer') => {
    if (session?.user?.containerId) {
      return queryClient.prefetchQuery({
        queryKey: ['builds', session.user.containerId, buildType],
        queryFn: async () => {
          const res = await fetch(`/api/builds?containerId=${session.user.containerId}&buildType=${buildType}`)
          if (!res.ok) throw new Error('Failed to fetch builds')
          return res.json()
        },
        staleTime: 5 * 60 * 1000,
      })
    }
  }, [queryClient, session?.user?.containerId])

  const prefetchAllOrganizationData = useCallback(() => {
    if (!activeOrganization?.id || !session?.user?.containerId) return

    return Promise.all([
      prefetchMembers(),
      prefetchBuilds('wisetour'),
      prefetchBuilds('wisetrainer'),
    ])
  }, [prefetchMembers, prefetchBuilds, activeOrganization?.id, session?.user?.containerId])

  return {
    prefetchMembers,
    prefetchBuilds,
    prefetchAllOrganizationData,
  }
}

export function usePrefetchOnHover() {
  const { prefetchMembers, prefetchBuilds } = usePrefetchOrganizationData()

  const handleMembersHover = useCallback(() => {
    prefetchMembers()
  }, [prefetchMembers])

  const handleWisetourHover = useCallback(() => {
    prefetchBuilds('wisetour')
  }, [prefetchBuilds])

  const handleWisetrainerHover = useCallback(() => {
    prefetchBuilds('wisetrainer')
  }, [prefetchBuilds])

  return {
    handleMembersHover,
    handleWisetourHover,
    handleWisetrainerHover,
  }
}