import { api, type ApiResponse } from '@/shared/api';

import type {
  MyApplicationDetailApiResponse,
  MyApplicationHistoryEntry,
  MyApplicationListApiResponse,
} from '../model/types';

const LIST_PATH = '/api/v1/me/job-applications';
const DETAIL_BASE_PATH = '/api/v1/job-applications';

export interface FetchMyApplicationListParams {
  page?: number;
  size?: number;
}

/** `GET /me/job-applications` — 내 지원 목록 조회. */
export async function fetchMyApplicationList(
  params: FetchMyApplicationListParams = {},
): Promise<MyApplicationListApiResponse> {
  const { data } = await api.get<ApiResponse<MyApplicationListApiResponse>>(LIST_PATH, {
    params: { page: 0, size: 20, ...params },
  });
  return data.data;
}

/** `GET /job-applications/{id}` — 본인 지원서 상세 조회. */
export async function fetchMyApplicationDetail(
  applicationId: number,
): Promise<MyApplicationDetailApiResponse> {
  const { data } = await api.get<ApiResponse<MyApplicationDetailApiResponse>>(
    `${DETAIL_BASE_PATH}/${applicationId}`,
  );
  return data.data;
}

/** `GET /job-applications/{id}/history` — 상태 변경 이력 조회. */
export async function fetchMyApplicationHistory(
  applicationId: number,
): Promise<MyApplicationHistoryEntry[]> {
  const { data } = await api.get<ApiResponse<MyApplicationHistoryEntry[]>>(
    `${DETAIL_BASE_PATH}/${applicationId}/history`,
  );
  return data.data;
}
