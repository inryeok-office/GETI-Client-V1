import { AdminAuditLogManagementPage } from '@/views/admin-audit-log-management';

interface AdminAuditLogsRouteProps {
  searchParams: Promise<{ auditLogId?: string; variant?: string }>;
}

export default function AdminAuditLogsRoute({ searchParams }: AdminAuditLogsRouteProps) {
  return <AdminAuditLogManagementPage searchParams={searchParams} />;
}
