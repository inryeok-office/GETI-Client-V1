import { AdminCollectorManagementPage } from '@/views/admin-collector-management';

interface AdminCollectorRouteProps {
  searchParams: Promise<{ runId?: string; variant?: string }>;
}

export default function AdminCollectorRoute({ searchParams }: AdminCollectorRouteProps) {
  return <AdminCollectorManagementPage searchParams={searchParams} />;
}
