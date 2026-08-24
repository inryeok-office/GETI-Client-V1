import { api, type ApiResponse } from '@/shared/api';

import { mapStaffApprovalRequest } from '../model/mapStaffApprovalRequest';
import type {
  AdminMemberSearchItem,
  AdminMemberStatus,
  StaffApprovalAction,
  StaffApprovalRequest,
  StaffApprovalStatus,
} from '../model/types';

const BASE_PATH = '/api/v1/admin/members';

interface AdminMemberSearchResponse {
  content: AdminMemberSearchItem[];
  totalPages: number;
}

const SERVER_STATUS_BY_TAB: Record<StaffApprovalStatus, AdminMemberStatus> = {
  pending: 'PENDING',
  approved: 'ACTIVE',
  rejected: 'REJECTED',
};

const STAFF_APPROVAL_PAGE_SIZE = 100;

async function fetchStaffApprovalPage(
  status: StaffApprovalStatus | undefined,
  page: number,
): Promise<AdminMemberSearchResponse> {
  const { data } = await api.get<ApiResponse<AdminMemberSearchResponse>>(`${BASE_PATH}/search`, {
    params: {
      role: 'TEACHER',
      status: status ? SERVER_STATUS_BY_TAB[status] : undefined,
      page,
      size: STAFF_APPROVAL_PAGE_SIZE,
    },
  });

  return data.data;
}

/**
 * 승인 대기(가입 요청) 목록. `role=TEACHER`로 고정해 학생·개발자는 제외한다. `status`를
 * 생략하면(전체 탭) TEACHER 전원을 반환받아 매핑 단계에서 SUSPENDED · WITHDRAWN을 걸러낸다.
 * `entities/company`의 `fetchAllCompanyOptions`와 같은 이유로 `totalPages` 끝까지 순회해
 * TEACHER 전원을 모은다(PR #158 코드리뷰 반영 — 첫 페이지만 보면 approved 이력이 쌓였을 때
 * "전체" 탭에서 100명을 넘는 뒷부분이 누락될 수 있었다).
 */
export async function fetchStaffApprovalRequests(
  status?: StaffApprovalStatus,
): Promise<StaffApprovalRequest[]> {
  const first = await fetchStaffApprovalPage(status, 0);
  const restPages = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      fetchStaffApprovalPage(status, index + 1),
    ),
  );

  return [first, ...restPages]
    .flatMap(({ content }) => content)
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
