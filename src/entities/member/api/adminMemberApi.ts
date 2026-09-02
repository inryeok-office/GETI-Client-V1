import { api, type ApiResponse } from '@/shared/api';

import type {
  AdminMemberDetail,
  AdminMemberRole,
  AdminMemberSearchResponse,
  AdminMemberStatus,
} from '../model/adminMember';
import type { DepartmentCode } from '../model/profileSetup';

const ADMIN_BASE_PATH = '/api/v1/admin/members';

export interface FetchAdminMemberListParams {
  /** 이름 부분 검색(대소문자 무시). 서버는 이메일 검색을 지원하지 않는다. */
  name?: string;
  status?: AdminMemberStatus;
  role?: AdminMemberRole;
  cohort?: number;
  department?: DepartmentCode;
  page?: number;
  size?: number;
}

/**
 * `GET /api/v1/admin/members/search`(GETI-Server-V1 #216) — Role·상태 무관 관리자용 회원 검색.
 * DEVELOPER 권한 전용이라, 권한이 없으면 403이 온다. 정렬은 서버 고정(`createdAt DESC`).
 */
export async function fetchAdminMemberList(
  params: FetchAdminMemberListParams = {},
): Promise<AdminMemberSearchResponse> {
  const { data } = await api.get<ApiResponse<AdminMemberSearchResponse>>(
    `${ADMIN_BASE_PATH}/search`,
    { params: { page: 0, size: 20, ...params } },
  );
  return data.data;
}

/**
 * `GET /api/v1/admin/members/{memberId}`(GETI-Server-V1 #216) — 관리자 관점 회원 상세.
 * 공개 프로필과 달리 이메일·전화번호·GitHub URL·거절 사유까지 포함한다.
 */
export async function fetchAdminMemberDetail(memberId: number): Promise<AdminMemberDetail> {
  const { data } = await api.get<ApiResponse<AdminMemberDetail>>(`${ADMIN_BASE_PATH}/${memberId}`);
  return data.data;
}
