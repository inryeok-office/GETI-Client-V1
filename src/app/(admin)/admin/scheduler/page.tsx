import { AdminSchedulerManagementPage } from '@/views/admin-scheduler-management';

interface AdminSchedulerRouteProps {
  searchParams: Promise<{ variant?: string }>;
}

export default function AdminSchedulerRoute({ searchParams }: AdminSchedulerRouteProps) {
  return <AdminSchedulerManagementPage searchParams={searchParams} />;
}
