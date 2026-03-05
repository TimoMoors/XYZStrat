'use client';

import { useRouter } from 'next/navigation';
import { RefreshButton } from './RefreshButton';
import type { DailyReport } from '@/lib/types';

interface DashboardClientProps {
  initialReport: DailyReport | null;
}

export function DashboardClient({ initialReport }: DashboardClientProps) {
  const router = useRouter();

  function handleRefresh() {
    router.refresh();
  }

  if (!initialReport) {
    return <RefreshButton onRefresh={handleRefresh} />;
  }

  return <RefreshButton onRefresh={handleRefresh} />;
}
