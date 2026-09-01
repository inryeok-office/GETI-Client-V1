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
const TEACHER_LIST_PATH = '/api/v1/admin/members';

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
  /** 담당 교사 memberId. `GET /api/v1/admin/members?role=TEACHER`로 채운 드롭다운 값. GETI-Server-V1 #181. */
  managerMemberId?: number;
  /** 생성 시각 하한(포함). `LocalDateTime`이라 KST 로컬 문자열로 보낸다. GETI-Server-V1 #282. */
  createdFrom?: string;
  /** 생성 시각 상한(미포함). GETI-Server-V1 #282. */
  createdTo?: string;
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

/** `GET /admin/job-applications/status-counts` 응답(GETI-Server-V1 #290). */
export interface ApplicationStatusCounts {
  /** DRAFT를 제외한 전체 지원서 수. */
  totalCount: number;
  /** 상태별 건수. DRAFT 키는 빠지고, 그 외 상태는 0이라도 포함된다. */
  counts: Partial<Record<ApplicantStatus, number>>;
}

/**
 * `GET /admin/job-applications/status-counts` — 지원서 상태별 건수. 관리자 대시보드 KPI ·
 * 처리 현황 표에서 상태별 `size=1` 요청을 여러 번 보내는 대신 한 번에 받는다. 필터는 없고
 * (mineOnly · jobId 불가) 전역 집계만 반환한다.
 */
export async function fetchApplicationStatusCounts(): Promise<ApplicationStatusCounts> {
  const { data } = await api.get<ApiResponse<ApplicationStatusCounts>>(
    `${BASE_PATH}/status-counts`,
  );
  return data.data;
}

/** 담당 공고 요약의 공고 상태. 서버 `JobStatus` enum 중 `job-summaries`가 실제로 반환하는 값
 * (`DELETED`는 삭제되지 않은 공고만 조회하므로 제외된다). GETI-Server-V1 #297. */
export type JobSummaryStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

/** `GET /admin/job-applications/job-summaries` 목록 항목(GETI-Server-V1 #297). */
export interface JobApplicationJobSummary {
  jobId: number;
  jobTitle: string;
  jobStatus: JobSummaryStatus;
  /** DRAFT 지원서를 제외한 전체 지원자 수. */
  applicantCount: number;
  /** 교직원 처리가 필요한 SUBMITTED · EDIT_REQUESTED 지원서 수. */
  pendingCount: number;
}

export interface JobApplicationJobSummariesResponse {
  content: JobApplicationJobSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface FetchJobApplicationJobSummariesParams {
  page?: number;
  size?: number;
}

/**
 * `GET /admin/job-applications/job-summaries` — 담당 공고별 지원 현황 요약. 로그인한 교직원 ·
 * 개발자가 담당하거나 등록한(삭제되지 않은) 공고를 최신순으로 페이지 조회하고, 공고별 지원자 수와
 * 처리 대기 수를 함께 준다. 교직원 대시보드 "담당 공고 현황" 표에서 공고마다 목록 API를 반복
 * 호출하지 않도록 한 번에 받는다. 필터는 없다.
 */
export async function fetchJobApplicationJobSummaries(
  params: FetchJobApplicationJobSummariesParams = {},
): Promise<JobApplicationJobSummariesResponse> {
  const { data } = await api.get<ApiResponse<JobApplicationJobSummariesResponse>>(
    `${BASE_PATH}/job-summaries`,
    { params: { page: 0, size: 20, ...params } },
  );
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

export interface JobApplicantOption {
  applicationId: number;
  applicantName: string | null;
}

const JOB_APPLICANT_PAGE_SIZE = 100;

/**
 * 다운로드 모달의 "지원자" 체크박스 목록을 만들기 위해 선택한 공고의 지원자 전원을
 * `totalPages` 끝까지 순회해 모은다. `fetchAllJobPostings`와 같은 이유로 페이지 크기가
 * 아니라 상한 없이 모든 페이지를 모은다.
 */
export async function fetchAllJobApplicants(jobId: number): Promise<JobApplicantOption[]> {
  const first = await fetchApplicantList({ jobId, page: 0, size: JOB_APPLICANT_PAGE_SIZE });
  const restPages = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      fetchApplicantList({ jobId, page: index + 1, size: JOB_APPLICANT_PAGE_SIZE }),
    ),
  );

  return [first, ...restPages].flatMap(({ content }) =>
    content.map((applicant) => ({
      applicationId: applicant.applicationId,
      applicantName: applicant.applicantName,
    })),
  );
}

export interface TeacherOption {
  memberId: number;
  name: string | null;
}

interface AdminMemberListResponse {
  members: TeacherOption[];
}

/**
 * 지원자 관리 화면의 "담당자" 드롭다운 선택지. `GET /api/v1/admin/members?role=TEACHER`
 * (GETI-Server-V1 #182, PR #198)는 ACTIVE 교사를 이름 오름차순으로 이미 정렬해 돌려주고
 * Pagination이 없어(교사 수가 학교 규모) 한 번만 호출하면 된다.
 */
export async function fetchTeacherOptions(): Promise<TeacherOption[]> {
  const { data } = await api.get<ApiResponse<AdminMemberListResponse>>(TEACHER_LIST_PATH, {
    params: { role: 'TEACHER' },
  });
  return data.data.members;
}

export interface ExportedFile {
  blob: Blob;
  filename: string;
}

/** `materialTypes` 값. PROFILE·ANSWERS는 XLSX 문서, ATTACHMENTS는 첨부파일. GETI-Server-V1 #242. */
export type ApplicationExportMaterialType = 'PROFILE' | 'ANSWERS' | 'ATTACHMENTS';

export interface ExportJobApplicationsParams {
  jobId: number;
  /**
   * 지정하면 그 지원서만 대상으로 한다. 생략하면 공고 전체 지원자가 대상이다(하위 호환,
   * GETI-Server-V1 #203/PR #215). 다른 공고 소속이거나 존재하지 않는 id는 서버가 오류 없이
   * 조용히 무시한다.
   */
  applicationIds?: number[];
  /**
   * 내보낼 자료 종류. 반복 키(`materialTypes=PROFILE&materialTypes=ANSWERS`)로 보낸다.
   * 비우거나 생략하면 서버 기본값(ATTACHMENTS)이다. GETI-Server-V1 #242.
   */
  materialTypes?: ApplicationExportMaterialType[];
}

const EXPORT_FILENAME_PATTERN = /filename="?([^";]+)"?/;

/**
 * `GET /admin/jobs/{jobId}/applications/export` — 공고 지원자 자료 일괄 다운로드(ZIP).
 * 응답이 JSON이 아니라 `application/zip` Binary라 `ApiResponse`로 감싸여 있지 않고, `responseType:
 * 'blob'`로 받는다. `applicationIds`는 axios 기본 직렬화(`ids[]=1&ids[]=2`)가 아니라 Spring이
 * 기대하는 반복 키(`applicationIds=1&applicationIds=2`) 형태로 보내야 해서 `paramsSerializer`를
 * 직접 지정한다.
 */
export async function exportJobApplications({
  jobId,
  applicationIds,
  materialTypes,
}: ExportJobApplicationsParams): Promise<ExportedFile> {
  const params: Record<string, unknown> = {};
  if (applicationIds) params.applicationIds = applicationIds;
  if (materialTypes && materialTypes.length > 0) params.materialTypes = materialTypes;

  const response = await api.get<Blob>(`${JOBS_BASE_PATH}/${jobId}/applications/export`, {
    responseType: 'blob',
    params: Object.keys(params).length > 0 ? params : undefined,
    paramsSerializer: { indexes: null },
  });
  const contentDisposition = response.headers['content-disposition'] as string | undefined;
  const filename =
    contentDisposition?.match(EXPORT_FILENAME_PATTERN)?.[1] ?? `job-${jobId}-applications.zip`;

  return { blob: response.data, filename };
}
