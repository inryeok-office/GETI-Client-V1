import { api, type ApiResponse } from '@/shared/api';

import type {
  ApplicantDetail,
  ApplicantHistoryEntry,
  ApplicantListResponse,
  ApplicantReviewAction,
  ApplicantStatus,
} from '../model/types';

const BASE_PATH = '/api/v1/admin/job-applications';
const JOBS_BASE_PATH = '/api/v1/admin/jobs';

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

export interface ExportedFile {
  blob: Blob;
  filename: string;
}

const EXPORT_FILENAME_PATTERN = /filename="?([^";]+)"?/;

/**
 * `GET /admin/jobs/{jobId}/applications/export` — 공고 지원자 자료 일괄 다운로드(ZIP).
 * 응답이 JSON이 아니라 `application/zip` Binary라 `ApiResponse`로 감싸여 있지 않고, `responseType:
 * 'blob'`로 받는다. 이 API는 `jobId` 단위로 그 공고 지원자 전원의 첨부파일을 묶어 줄 뿐,
 * 개별 지원자 선택이나 자료 종류 선택에 대응하는 파라미터는 없다(GETI-Server PR #157).
 */
export async function exportJobApplications(jobId: number): Promise<ExportedFile> {
  const response = await api.get<Blob>(`${JOBS_BASE_PATH}/${jobId}/applications/export`, {
    responseType: 'blob',
  });
  const contentDisposition = response.headers['content-disposition'] as string | undefined;
  const filename =
    contentDisposition?.match(EXPORT_FILENAME_PATTERN)?.[1] ?? `job-${jobId}-applications.zip`;

  return { blob: response.data, filename };
}
