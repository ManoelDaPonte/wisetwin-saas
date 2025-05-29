'use client';

import { BuildsTable } from '@/app/(app)/(features-unity)/components/builds-table';
import { useBuilds } from '@/app/hooks/use-builds';

export default function WisetrainerPage() {
  const { data: builds, isLoading, error } = useBuilds('wisetrainer');

  return (
    <div className="container mx-auto py-8">
      <BuildsTable 
        builds={builds}
        isLoading={isLoading}
        error={error}
        title="Formations Wisetrainer"
        description="Gérez et lancez vos modules de formation Unity"
      />
    </div>
  );
}
