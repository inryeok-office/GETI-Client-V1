import {
  AdminSchedulerManagement,
  type AdminSchedulerListStatus,
} from '@/widgets/admin-scheduler-management';

import { MOCK_SCHEDULED_TASKS } from '../model/mock';

const VARIANT_TO_STATUS: Record<string, AdminSchedulerListStatus> = {
  empty: 'empty',
  error: 'error',
  loading: 'loading',
  success: 'success',
};

interface AdminSchedulerManagementPageProps {
  searchParams: Promise<{ variant?: string }>;
}

/** 목업 데이터로 정기 작업 관리 화면의 디자인 상태를 검토하는 정적 화면. */
export async function AdminSchedulerManagementPage({
  searchParams,
}: AdminSchedulerManagementPageProps) {
  const { variant } = await searchParams;
  const status = VARIANT_TO_STATUS[variant ?? 'success'] ?? 'success';

  return (
    <AdminSchedulerManagement
      initialStatus={status}
      tasks={status === 'empty' ? [] : MOCK_SCHEDULED_TASKS}
    />
  );
}
