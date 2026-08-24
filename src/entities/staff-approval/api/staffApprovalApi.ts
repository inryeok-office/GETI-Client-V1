import { api, type ApiResponse } from '@/shared/api';

import { mapStaffApprovalRequest } from '../model/mapStaffApprovalRequest';
import type {
  StaffApprovalAction,
  StaffApprovalRequest,
  StaffApprovalStatus,
} from '../model/types';

const BASE_PATH = '/api/v1/admin/members';

export type AdminMemberStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED' | 'WITHDRAWN';

/** `GET /admin/members/search` 응답 항목 중 이 화면이 쓰는 필드만. */
export interface AdminMemberSearchItem {
  memberId: number;
  email: string;
  name: string | null;
  status: AdminMemberStatus;
  createdAt: string;
}

interface AdminMemberSearchResponse {
  content: AdminMemberSearchItem[];
}

const SERVER_STATUS_BY_TAB: Record<StaffApprovalStatus, AdminMemberStatus> = {
  pending: 'PENDING',
  approved: 'ACTIVE',
  rejected: 'REJECTED',
};

/**
 * 승인 대기(가입 요청) 목록. `role=TEACHER`로 고정해 학생·개발자는 제외한다. `status`를
 * 생략하면(전체 탭) TEACHER 전원을 반환받아 매핑 단계에서 SUSPENDED · WITHDRAWN을 걸러낸다.
 * size는 페이지네이션 없이 학교 규모의 교직원 전원을 한 번에 담을 수 있는 값이다(교사 수
 * 상한, `GET /admin/members`(role 조회 전용)의 "교사 수가 학교 규모" 설명과 동일한 전제).
 */
export async function fetchStaffApprovalRequests(
  status?: StaffApprovalStatus,
): Promise<StaffApprovalRequest[]> {
  const { data } = await api.get<ApiResponse<AdminMemberSearchResponse>>(`${BASE_PATH}/search`, {
    params: {
      role: 'TEACHER',
      status: status ? SERVER_STATUS_BY_TAB[status] : undefined,
      page: 0,
      size: 100,
    },
  });

  return data.data.content
    .map(mapStaffApprovalRequest)
    .filter((request): request is StaffApprovalRequest => request !== null);
}

export interface ExecuteStaffApprovalActionParams {
  memberId: number;
  action: StaffApprovalAction;
  /** REJECT는 사유가 필수다. */
  reason?: string;
}

/** `POST /admin/members/{memberId}/approval-actions` — 교직원 가입 승인·거절. */
export async function executeStaffApprovalAction({
  memberId,
  action,
  reason,
}: ExecuteStaffApprovalActionParams): Promise<void> {
  await api.post(`${BASE_PATH}/${memberId}/approval-actions`, { action, reason: reason ?? null });
}
