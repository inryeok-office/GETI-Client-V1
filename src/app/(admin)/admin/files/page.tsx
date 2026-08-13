import { AdminCommonFileManagementPage } from '@/views/admin-common-file-management';

interface AdminCommonFileRouteProps {
  searchParams: Promise<{ variant?: string }>;
}

export default function AdminCommonFileRoute({ searchParams }: AdminCommonFileRouteProps) {
  return <AdminCommonFileManagementPage searchParams={searchParams} />;
}
