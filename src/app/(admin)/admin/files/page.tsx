import { AdminCommonFileManagementPage } from '@/views/admin-common-file-management';

interface AdminCommonFileRouteProps {
  searchParams: Promise<{
    originalName?: string;
    page?: string;
    purpose?: string;
    size?: string;
    status?: string;
  }>;
}

export default async function AdminCommonFileRoute({ searchParams }: AdminCommonFileRouteProps) {
  return <AdminCommonFileManagementPage initialSearchParams={await searchParams} />;
}
