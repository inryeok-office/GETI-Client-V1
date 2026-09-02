import { SessionGuard } from '@/features/session-guard';
import { AdminSchedulerManagementPage } from '@/views/admin-scheduler-management';

const SCHEDULER_ROLES = ['DEVELOPER'] as const;

export default function AdminSchedulerRoute() {
  return (
    <SessionGuard allowedRoles={SCHEDULER_ROLES}>
      <AdminSchedulerManagementPage />
    </SessionGuard>
  );
}
