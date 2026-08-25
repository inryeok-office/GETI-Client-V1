import {
  AdminCollectorManagement,
  type AdminCollectorListStatus,
} from '@/widgets/admin-collector-management';

import { MOCK_COLLECTOR_RUNS } from '../model/mock';

const STATUSES: AdminCollectorListStatus[] = ['empty', 'error', 'loading', 'success'];

interface AdminCollectorManagementPageProps {
  searchParams: Promise<{ runId?: string; variant?: string }>;
}

export async function AdminCollectorManagementPage({
  searchParams,
}: AdminCollectorManagementPageProps) {
  const { runId, variant: requestedStatus = 'success' } = await searchParams;
  const initialStatus = STATUSES.includes(requestedStatus as AdminCollectorListStatus)
    ? (requestedStatus as AdminCollectorListStatus)
    : 'success';

  return (
    <AdminCollectorManagement
      initialSelectedRunId={runId}
      initialStatus={initialStatus}
      runs={initialStatus === 'empty' ? [] : MOCK_COLLECTOR_RUNS}
    />
  );
}
