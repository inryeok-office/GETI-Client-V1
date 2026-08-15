import { AdminUserManagementPage } from '@/views/admin-user-management';

interface AdminUsersRouteProps {
  searchParams: Promise<{ memberId?: string; variant?: string }>;
}

export default function AdminUsersRoute({ searchParams }: AdminUsersRouteProps) {
  return <AdminUserManagementPage searchParams={searchParams} />;
}
