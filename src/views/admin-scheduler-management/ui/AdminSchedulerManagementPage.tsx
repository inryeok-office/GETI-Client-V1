'use client';

import { useOperationJobsQuery } from '@/entities/scheduler';
import {
  AdminSchedulerManagement,
  type AdminSchedulerListStatus,
} from '@/widgets/admin-scheduler-management';

const PAGE_SIZE = 20;

export function AdminSchedulerManagementPage() {
  const jobsQuery = useOperationJobsQuery({ page: 0, size: PAGE_SIZE });
  const tasks = jobsQuery.data?.content ?? [];
  const listStatus: AdminSchedulerListStatus = jobsQuery.isLoading
    ? 'loading'
    : jobsQuery.isError
      ? 'error'
      : tasks.length === 0
        ? 'empty'
        : 'success';

  return (
    <AdminSchedulerManagement
      listStatus={listStatus}
      tasks={tasks}
      onRetry={() => void jobsQuery.refetch()}
    />
  );
}
