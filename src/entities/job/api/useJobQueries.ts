'use client';

import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query';

import { fetchJobDetail, fetchJobList, type FetchJobListParams } from './jobApi';

export const jobKeys = {
  all: ['jobs'] as const,
  list: (params: FetchJobListParams) => [...jobKeys.all, 'list', params] as const,
  detail: (jobId: number) => [...jobKeys.all, 'detail', jobId] as const,
};

/**
 * `keepPreviousData`로 페이지를 넘길 때 이전 페이지 데이터를 유지한 채 다음 페이지를 가져온다 —
 * 호출부가 `isLoading`(최초 로딩)과 `isFetching`(페이지 전환 로딩)을 구분해 두 스켈레톤 상태를 나눌 수 있다.
 */
export function useJobListQuery(params: FetchJobListParams = {}) {
  return useQuery({
    queryKey: jobKeys.list(params),
    queryFn: () => fetchJobList(params),
    placeholderData: keepPreviousData,
  });
}

/** jobId는 호출부에서 `Number.isInteger`로 걸러진 값만 넘긴다(NaN 요청 방지). */
export function useJobDetailQuery(jobId: number | null) {
  return useQuery({
    queryKey: jobKeys.detail(jobId ?? -1),
    queryFn: jobId === null ? skipToken : () => fetchJobDetail(jobId),
  });
}
