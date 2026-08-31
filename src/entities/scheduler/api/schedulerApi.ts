import { api, type ApiResponse } from '@/shared/api';

import type { OperationJobListResponse, OperationJobType } from '../model/types';

const OPERATION_JOBS_PATH = '/api/v1/admin/system/jobs';

export interface FetchOperationJobsParams {
  jobType?: OperationJobType;
  /** 마지막 실행 상태 문자열 완전 일치(예: `FAILED`). */
  status?: string;
  page?: number;
  size?: number;
}

/**
 * `GET /api/v1/admin/system/jobs` — 등록된 정기 작업 6종의 최근 실행 상태(GETI-Server-V1 #239).
 * DEVELOPER 전용. 서버가 6개를 메모리에서 필터·페이지네이션하므로 `totalElements`는 필터된
 * 개수다. 개발자 대시보드에서 `status=FAILED`의 `totalElements`(정기 작업 실패 건수)와
 * `jobType=JOB_COLLECTION` 항목의 `failureCount`(외부 공고 수집 실패)를 읽는다.
 */
export async function fetchOperationJobs(
  params: FetchOperationJobsParams = {},
): Promise<OperationJobListResponse> {
  const { data } = await api.get<ApiResponse<OperationJobListResponse>>(OPERATION_JOBS_PATH, {
    params: { page: 0, size: 20, ...params },
  });
  return data.data;
}
