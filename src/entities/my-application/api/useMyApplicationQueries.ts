'use client';

import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  executeMyApplicationAction,
  fetchMyApplicationDetail,
  fetchMyApplicationHistory,
  fetchMyApplicationList,
  type ExecuteMyApplicationActionParams,
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

/** 지원 취소 · 수정 권한 요청 등 학생 Action. 성공하면 해당 지원서의 상세 · 이력을 다시 불러온다. */
export function useMyApplicationActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ExecuteMyApplicationActionParams) => executeMyApplicationAction(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: myApplicationKeys.detail(variables.applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: myApplicationKeys.history(variables.applicationId),
      });
      queryClient.invalidateQueries({ queryKey: myApplicationKeys.all });
    },
  });
}
