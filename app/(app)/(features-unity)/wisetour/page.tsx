'use client';

import { BuildsTable } from '@/app/(app)/(features-unity)/components/builds-table';
import { useBuilds } from '@/app/hooks/use-builds';

export default function WisetourPage() {
  const { data: builds, isLoading, error } = useBuilds('wisetour');

  return (
    <div className="container mx-auto py-8">
      <BuildsTable 
        builds={builds}
        isLoading={isLoading}
        error={error}
        title="Environnements Wisetour"
        description="Gérez et lancez vos environnements industriels Unity"
      />
    </div>
  );
} 