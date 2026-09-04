import { api, type ApiResponse } from '@/shared/api';

import type { AdminProgramSearchResponse, AdminProgramStatus } from '../model/types';

const ADMIN_BASE_PATH = '/api/v1/admin/programs';

export interface FetchAdminProgramListParams {
  /** 프로그램 제목 부분 일치 검색어. */
  query?: string;
  /** 생략하면 DELETED를 제외한 전체, `DELETED`면 삭제 이력. */
  status?: AdminProgramStatus;
  page?: number;
  /** 서버 최대값 100. */
  size?: number;
}

/**
 * `GET /api/v1/admin/programs`(GETI-Server-V1 #312) — 관리자 프로그램 목록 조회.
 * 최신 생성 순(생성 시각 동일 시 ID 내림차순) 고정 정렬이라 sort 파라미터는 보내지 않는다.
 * 교사·개발자 권한이 필요하다.
 */
export async function fetchAdminProgramList(
  params: FetchAdminProgramListParams = {},
): Promise<AdminProgramSearchResponse> {
  const { data } = await api.get<ApiResponse<AdminProgramSearchResponse>>(ADMIN_BASE_PATH, {
    params: { page: 0, size: 20, ...params },
  });
  return data.data;
}
