'use client';

import { BuildsTable } from '@/app/(app)/(features-unity)/components/builds-table';
import { useBuilds } from '@/app/hooks/use-builds';

export default function HomePage() {
  const { data: wisetrainerBuilds, isLoading, error } = useBuilds('wisetrainer');

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Builds Wisetrainer récents</h2>
        <BuildsTable 
          builds={wisetrainerBuilds}
          isLoading={isLoading}
          error={error}
          title="Formations disponibles"
          description="Vos derniers modules de formation Unity"
        />
      </div>
    </div>
  )
} 