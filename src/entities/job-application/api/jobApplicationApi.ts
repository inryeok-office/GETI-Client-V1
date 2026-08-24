import { api, type ApiResponse } from '@/shared/api';

import type {
  ApplicationAnswer,
  JobApplicationActionType,
  JobApplicationDraft,
  UploadedApplicationFile,
} from '../model/types';

const APPLICATIONS_BASE = '/api/v1/job-applications';

/** `POST /jobs/{jobId}/applications` — 지원서 초안 생성. 이미 활성 지원서가 있으면 409(재조회 방법 없음)다. */
export async function createJobApplicationDraft(jobId: number): Promise<JobApplicationDraft> {
  const { data } = await api.post<ApiResponse<JobApplicationDraft>>(
    `/api/v1/jobs/${jobId}/applications`,
    { prefillProfileFields: true },
  );
  return data.data;
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
