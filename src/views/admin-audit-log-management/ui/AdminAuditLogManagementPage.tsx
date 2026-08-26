import {
  AdminAuditLogManagement,
  type AdminAuditLogManagementSearchParams,
} from '@/widgets/admin-audit-log-management';

export interface AdminAuditLogManagementPageProps {
  searchParams: Promise<AdminAuditLogManagementSearchParams>;
}

export async function AdminAuditLogManagementPage({
  searchParams,
}: AdminAuditLogManagementPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <AdminAuditLogManagement
      key={JSON.stringify(resolvedSearchParams)}
      initialSearchParams={resolvedSearchParams}
    />
  );
}
