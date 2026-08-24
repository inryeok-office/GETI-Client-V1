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

/** `applicantDepartment` 필터 값. 회원 프로필의 department enum과 동일하다. */
export type ApplicantDepartment = 'SW_DEVELOPMENT' | 'SMART_IOT' | 'AI';

export interface FetchApplicantListParams {
  jobId?: number;
  status?: ApplicantStatus;
  /** 지원자 이름 부분 검색(대소문자 무시). GETI-Server-V1 #181. */
  applicantName?: string;
  /** GETI-Server-V1 #181. */
  cohort?: number;
  /** GETI-Server-V1 #181. */
  department?: ApplicantDepartment;
  /** true면 로그인한 사용자가 담당(또는 등록)한 공고의 지원서만 조회한다. GETI-Server-V1 #181. */
  mineOnly?: boolean;
  /** GETI-Server-V1 #181. */
  companyId?: number;
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

export interface JobPostingOption {
  jobId: number;
  title: string;
}

const JOB_POSTING_PAGE_SIZE = 100;

/**
 * 다운로드 모달의 "공고" 드롭다운 선택지를 만들기 위해 `GET /admin/job-applications`를 `totalPages`
 * 끝까지 순회하며 jobId를 추린다. 관리자 전용 "공고 목록" API가 아직 없어(GETI-Server-V1 #60
 * "관리자 목록"은 후속으로 남음) 지원자 목록에서 우회 추출해야 하는데, 한 페이지만 보면 한 공고
 * 지원자가 페이지 대부분을 차지하거나 전체 지원자가 페이지 크기를 넘을 때 이후 공고가 선택지에서
 * 누락된다(PR #134 코드리뷰 반영) — 그래서 페이지 크기가 아니라 상한 없이 모든 페이지를 모은다.
 */
export async function fetchAllJobPostings(): Promise<JobPostingOption[]> {
  const first = await fetchApplicantList({ page: 0, size: JOB_POSTING_PAGE_SIZE });
  const restPages = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      fetchApplicantList({ page: index + 1, size: JOB_POSTING_PAGE_SIZE }),
    ),
  );

  const jobPostings = new Map<number, JobPostingOption>();
  for (const { content } of [first, ...restPages]) {
    for (const applicant of content) {
      jobPostings.set(applicant.jobId, {
        jobId: applicant.jobId,
        title: applicant.jobTitle ?? 'ㅡ',
      });
    }
  }
  return Array.from(jobPostings.values());
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
