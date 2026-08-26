import { AdminCollectorManagementPage } from '@/views/admin-collector-management';

interface AdminCollectorRouteProps {
  searchParams: Promise<{
    endDate?: string;
    page?: string;
    runId?: string;
    size?: string;
    sourceId?: string;
    startDate?: string;
    status?: string;
  }>;
}

export default async function AdminCollectorRoute({ searchParams }: AdminCollectorRouteProps) {
  return <AdminCollectorManagementPage initialSearchParams={await searchParams} />;
}
