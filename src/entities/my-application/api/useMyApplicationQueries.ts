'use client';

import { skipToken, useQuery } from '@tanstack/react-query';

import {
  fetchMyApplicationDetail,
  fetchMyApplicationHistory,
  fetchMyApplicationList,
  type FetchMyApplicationListParams,
} from './myApplicationApi';

export const myApplicationKeys = {
  all: ['myApplications'] as const,
  list: (params: FetchMyApplicationListParams) =>
    [...myApplicationKeys.all, 'list', params] as const,
  detail: (applicationId: number) => [...myApplicationKeys.all, 'detail', applicationId] as const,
  history: (applicationId: number) => [...myApplicationKeys.all, 'history', applicationId] as const,
};

export function useMyApplicationListQuery(params: FetchMyApplicationListParams = {}) {
  return useQuery({
    queryKey: myApplicationKeys.list(params),
    queryFn: () => fetchMyApplicationList(params),
  });
}

/** applicationId는 호출부에서 `Number.isInteger`로 걸러진 값만 받는다(NaN 요청 방지). */
export function useMyApplicationDetailQuery(applicationId: number | null) {
  return useQuery({
    queryKey: myApplicationKeys.detail(applicationId ?? -1),
    queryFn: applicationId === null ? skipToken : () => fetchMyApplicationDetail(applicationId),
  });
}

/** applicationId는 호출부에서 `Number.isInteger`로 걸러진 값만 받는다(NaN 요청 방지). */
export function useMyApplicationHistoryQuery(applicationId: number | null) {
  return useQuery({
    queryKey: myApplicationKeys.history(applicationId ?? -1),
    queryFn: applicationId === null ? skipToken : () => fetchMyApplicationHistory(applicationId),
  });
}
