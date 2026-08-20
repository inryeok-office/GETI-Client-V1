import { api, type ApiResponse } from '@/shared/api';

import type {
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
