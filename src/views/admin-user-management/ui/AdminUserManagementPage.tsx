import { AdminUserTable, type AdminUserManagementSearchParams } from '@/widgets/admin-user-table';

interface AdminUserManagementPageProps {
  searchParams: Promise<AdminUserManagementSearchParams>;
}

export async function AdminUserManagementPage({ searchParams }: AdminUserManagementPageProps) {
  const initialSearchParams = await searchParams;

  return <AdminUserTable initialSearchParams={initialSearchParams} />;
}
