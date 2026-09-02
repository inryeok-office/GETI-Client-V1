import {
  AdminUserManagementPage,
  type AdminUserManagementSearchParams,
} from '@/views/admin-user-management';

interface AdminUsersRouteProps {
  searchParams: Promise<AdminUserManagementSearchParams>;
}

export default function AdminUsersRoute({ searchParams }: AdminUsersRouteProps) {
  return <AdminUserManagementPage searchParams={searchParams} />;
}
