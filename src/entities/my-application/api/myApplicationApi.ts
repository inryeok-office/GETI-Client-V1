import { api, type ApiResponse } from '@/shared/api';

import type {
  MyApplicationAction,
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

export interface ExecuteMyApplicationActionParams {
  applicationId: number;
  action: MyApplicationAction;
}

/** `POST /job-applications/{id}/actions` — 지원 취소 · 수정 권한 요청 등 학생 Action 수행. */
export async function executeMyApplicationAction({
  applicationId,
  action,
}: ExecuteMyApplicationActionParams): Promise<MyApplicationDetailApiResponse> {
  const { data } = await api.post<ApiResponse<MyApplicationDetailApiResponse>>(
    `${DETAIL_BASE_PATH}/${applicationId}/actions`,
    { action },
  );
  return data.data;
}
