import { api, type ApiResponse } from '@/shared/api';

import type {
  ApplicantDetail,
  ApplicantHistoryEntry,
  ApplicantListResponse,
  ApplicantReviewAction,
  ApplicantStatus,
} from '../model/types';

const BASE_PATH = '/api/v1/admin/job-applications';

export interface FetchApplicantListParams {
  jobId?: number;
  status?: ApplicantStatus;
  page?: number;
  size?: number;
}

/** `GET /admin/job-applications` — 지원서 목록 조회. */
export async function fetchApplicantList(
  params: FetchApplicantListParams = {},
): Promise<ApplicantListResponse> {
  const { data } = await api.get<ApiResponse<ApplicantListResponse>>(BASE_PATH, {
    params: { page: 0, size: 20, ...params },
  });
  return data.data;
}

/** `GET /admin/job-applications/{id}` — 지원서 상세 조회. */
export async function fetchApplicantDetail(applicationId: number): Promise<ApplicantDetail> {
  const { data } = await api.get<ApiResponse<ApplicantDetail>>(`${BASE_PATH}/${applicationId}`);
  return data.data;
}

/** `GET /admin/job-applications/{id}/history` — 상태 변경 이력 조회. */
export async function fetchApplicantHistory(
  applicationId: number,
): Promise<ApplicantHistoryEntry[]> {
  const { data } = await api.get<ApiResponse<ApplicantHistoryEntry[]>>(
    `${BASE_PATH}/${applicationId}/history`,
  );
  return data.data;
}

export interface ExecuteApplicantActionParams {
  applicationId: number;
  action: ApplicantReviewAction;
  /** REQUEST_REVISION · REJECT는 사유가 필수다. */
  reason?: string | null;
}

/** `POST /admin/job-applications/{id}/actions` — 승인 · 거절 · 보완 요청 · 수정 허용. */
export async function executeApplicantAction({
  applicationId,
  action,
  reason,
}: ExecuteApplicantActionParams): Promise<ApplicantDetail> {
  const { data } = await api.post<ApiResponse<ApplicantDetail>>(
    `${BASE_PATH}/${applicationId}/actions`,
    { action, reason: reason ?? null },
  );
  return data.data;
}
