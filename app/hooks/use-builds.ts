import { useQuery } from '@tanstack/react-query'
import { useContainer } from './use-container'
import { Build, BuildType } from '@/lib/azure'

async function fetchBuilds(containerId: string, buildType: BuildType): Promise<{ builds: Build[] }> {
  const response = await fetch(`/api/builds?containerId=${containerId}&type=${buildType}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch builds')
  }
  
  return response.json()
}

export function useBuilds(buildType: BuildType) {
  const { containerId, isReady } = useContainer()
  
  return useQuery({
    queryKey: ['builds', containerId, buildType],
    queryFn: () => fetchBuilds(containerId!, buildType),
    enabled: isReady && !!containerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
    refetchOnWindowFocus: false,
  })
} 