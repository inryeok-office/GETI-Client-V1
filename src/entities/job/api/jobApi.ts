import { api, type ApiResponse } from '@/shared/api';

import type {
  JobApplicationMethod,
  JobDetail,
  JobPostingType,
  JobSearchResponse,
  JobSort,
  JobSortDirection,
  PublicJobStatus,
} from '../model/types';

const BASE_PATH = '/api/v1/jobs';

export interface FetchJobListParams {
  query?: string;
  postingType?: JobPostingType;
  applicationMethod?: JobApplicationMethod;
  status?: PublicJobStatus;
  sourceName?: string;
  targetGrade?: number;
  /** true면 마감된 공고를 제외한다("마감 공고 포함" 토글이 꺼진 상태). */
  openOnly?: boolean;
  sort?: JobSort;
  direction?: JobSortDirection;
  page?: number;
  size?: number;
}

/** `GET /api/v1/jobs`(GETI-Server `JobSearchController`) — 공고 목록/검색 조회. */
export async function fetchJobList(params: FetchJobListParams = {}): Promise<JobSearchResponse> {
  const { data } = await api.get<ApiResponse<JobSearchResponse>>(BASE_PATH, {
    params: { page: 0, size: 20, ...params },
  });
  return data.data;
}

/**
 * `GET /api/v1/jobs/{jobId}`(GETI-Server `JobController`) — 공고 상세 조회.
 * 조회할 때마다 서버의 viewCount가 올라간다(GETI-Server 쪽 동작, 중복 방문도 그대로 반영됨).
 */
export async function fetchJobDetail(jobId: number): Promise<JobDetail> {
  const { data } = await api.get<ApiResponse<JobDetail>>(`${BASE_PATH}/${jobId}`);
  return data.data;
}
