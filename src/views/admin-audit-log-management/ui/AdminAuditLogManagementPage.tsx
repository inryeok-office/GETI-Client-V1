import {
  AdminAuditLogManagement,
  type AdminAuditLogListStatus,
} from '@/widgets/admin-audit-log-management';

import { MOCK_AUDIT_LOGS } from '../model/mock';

const STATUSES: AdminAuditLogListStatus[] = ['empty', 'error', 'loading', 'success'];

interface AdminAuditLogManagementPageProps {
  searchParams: Promise<{ auditLogId?: string; variant?: string }>;
}

export async function AdminAuditLogManagementPage({
  searchParams,
}: AdminAuditLogManagementPageProps) {
  const { auditLogId, variant: requestedStatus = 'success' } = await searchParams;
  const initialStatus = STATUSES.includes(requestedStatus as AdminAuditLogListStatus)
    ? (requestedStatus as AdminAuditLogListStatus)
    : 'success';

  return (
    <AdminAuditLogManagement
      initialSelectedAuditLogId={auditLogId}
      initialStatus={initialStatus}
      logs={initialStatus === 'empty' ? [] : MOCK_AUDIT_LOGS}
    />
  );
}
