'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchOperationJobs, type FetchOperationJobsParams } from './schedulerApi';

export const schedulerKeys = {
  all: ['scheduler'] as const,
  operationJobs: (params: FetchOperationJobsParams) =>
    [...schedulerKeys.all, 'operation-jobs', params] as const,
};

/** 정기 작업 운영 상태 조회(`GET /admin/system/jobs`, DEVELOPER 전용). */
export function useOperationJobsQuery(params: FetchOperationJobsParams = {}) {
  return useQuery({
    queryKey: schedulerKeys.operationJobs(params),
    queryFn: () => fetchOperationJobs(params),
  });
}
