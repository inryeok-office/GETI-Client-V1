import { api, type ApiResponse } from '@/shared/api';

import type {
  ApplicationAnswer,
  JobApplicationActionType,
  JobApplicationDraft,
  UploadedApplicationFile,
} from '../model/types';

const APPLICATIONS_BASE = '/api/v1/job-applications';
const MY_APPLICATIONS_PATH = '/api/v1/me/job-applications';

/**
 * `POST /jobs/{jobId}/applications` — 지원서 초안 생성. 이미 활성 지원서가 있으면
 * 409 `ACTIVE_APPLICATION_EXISTS`다 — 이땐 `findActiveJobApplicationDraft`로 이어서 작성한다.
 */
export async function createJobApplicationDraft(jobId: number): Promise<JobApplicationDraft> {
  const { data } = await api.post<ApiResponse<JobApplicationDraft>>(
    `/api/v1/jobs/${jobId}/applications`,
    { prefillProfileFields: true },
  );
  return data.data;
}

/**
 * `GET /job-applications/{id}` — 본인 지원서 상세. 임시저장 중이면 DRAFT를 그대로 준다.
 * 초안 생성 응답과 같은 `JobApplicationDraftResponse` DTO라 `questions`·`answers`·`files`가 모두
 * 들어 있다(GETI-Server-V1 #186/#234).
 */
export async function fetchJobApplicationDraft(
  applicationId: number,
): Promise<JobApplicationDraft> {
  const { data } = await api.get<ApiResponse<JobApplicationDraft>>(
    `${APPLICATIONS_BASE}/${applicationId}`,
  );
  return data.data;
}

interface MyJobApplicationDraftSummary {
  applicationId: number;
  job: { jobId: number } | null;
}

/**
 * `POST /jobs/{jobId}/applications`가 409(`ACTIVE_APPLICATION_EXISTS`)를 냈을 때, 그 공고에
 * 이미 있는 임시저장 지원서를 찾아 이어서 작성하도록 돌려준다(GETI-Server-V1 #186). DRAFT를
 * 못 찾으면(그새 제출·철회로 상태가 넘어감) null. `/me/job-applications` 목록의 상세 뷰는
 * `entities/my-application` 소유라, 여기선 매칭에 필요한 최소 필드만 읽는다.
 */
export async function findActiveJobApplicationDraft(
  jobId: number,
): Promise<JobApplicationDraft | null> {
  const { data } = await api.get<ApiResponse<{ content: MyJobApplicationDraftSummary[] }>>(
    MY_APPLICATIONS_PATH,
    { params: { status: 'DRAFT', page: 0, size: 100 } },
  );

  const existing = data.data.content.find((item) => item.job?.jobId === jobId);
  if (!existing) return null;

  return fetchJobApplicationDraft(existing.applicationId);
}

export interface SaveJobApplicationDraftParams {
  applicationId: number;
  contactPhone?: string;
  privacyConsent?: boolean;
  answers?: ApplicationAnswer[];
}

/** `PATCH /job-applications/{id}` — 임시저장(반복 가능). 넘긴 필드만 바뀐다. */
export async function saveJobApplicationDraft({
  applicationId,
  ...body
}: SaveJobApplicationDraftParams): Promise<JobApplicationDraft> {
  const { data } = await api.patch<ApiResponse<JobApplicationDraft>>(
    `${APPLICATIONS_BASE}/${applicationId}`,
    body,
  );
  return data.data;
}

export interface ExecuteJobApplicationActionParams {
  applicationId: number;
  action: JobApplicationActionType;
}

/** `POST /job-applications/{id}/actions` — 제출 · 수정요청 · 재제출 · 철회. */
export async function executeJobApplicationAction({
  applicationId,
  action,
}: ExecuteJobApplicationActionParams): Promise<JobApplicationDraft> {
  const { data } = await api.post<ApiResponse<JobApplicationDraft>>(
    `${APPLICATIONS_BASE}/${applicationId}/actions`,
    { action },
  );
  return data.data;
}

/**
 * `POST /files`(purpose=JOB_APPLICATION) — 첨부파일 업로드. 받은 `fileId`를 FILE 타입 문항의
 * `answers[].fileIds`에 담아 임시저장(PATCH)해야 실제 지원서에 묶인다(GETI-Server-V1 #217/#234).
 */
export async function uploadApplicationFile(file: File): Promise<UploadedApplicationFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', 'JOB_APPLICATION');

  const { data } = await api.post<ApiResponse<UploadedApplicationFile>>('/api/v1/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}
