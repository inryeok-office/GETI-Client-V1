'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  executeStaffApprovalAction,
  fetchStaffApprovalCount,
  fetchStaffApprovalRequests,
  type ExecuteStaffApprovalActionParams,
} from './staffApprovalApi';
import type { StaffApprovalStatus } from '../model/types';

export const staffApprovalKeys = {
  all: ['staff-approvals'] as const,
  list: (status?: StaffApprovalStatus) => [...staffApprovalKeys.all, 'list', status] as const,
  count: (status: StaffApprovalStatus) => [...staffApprovalKeys.all, 'count', status] as const,
};

export function useStaffApprovalListQuery(status?: StaffApprovalStatus) {
  return useQuery({
    queryKey: staffApprovalKeys.list(status),
    queryFn: () => fetchStaffApprovalRequests(status),
  });
}

/** 관리자 대시보드 "가입 승인 대기" KPI. 목록을 순회하지 않고 건수만 조회한다. */
export function useStaffApprovalCountQuery(status: StaffApprovalStatus) {
  return useQuery({
    queryKey: staffApprovalKeys.count(status),
    queryFn: () => fetchStaffApprovalCount(status),
  });
}

/**
 * 승인 · 거절 Action. `onSettled`라 성공은 물론 403 · 409 · 그 외 실패를 가리지 않고
 * 완료되면 목록을 다시 불러온다 — 특히 409(다른 관리자가 먼저 처리)는 화면에 최신 상태를
 * 보여준 뒤 충돌 안내를 하기 위해서다.
 */
export function useStaffApprovalActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ExecuteStaffApprovalActionParams) => executeStaffApprovalAction(params),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: staffApprovalKeys.all });
    },
  });
}
