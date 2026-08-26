import {
  AdminAuditLogManagementPage,
  type AdminAuditLogManagementPageProps,
} from '@/views/admin-audit-log-management';

type AdminAuditLogsRouteProps = AdminAuditLogManagementPageProps;

export default function AdminAuditLogsRoute({ searchParams }: AdminAuditLogsRouteProps) {
  return <AdminAuditLogManagementPage searchParams={searchParams} />;
}
