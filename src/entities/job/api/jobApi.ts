import { api, type ApiResponse } from '@/shared/api';

import type {
  AdminJobDetail,
  AdminJobSearchResponse,
  AdminJobStatus,
  JobApplicationMethod,
  JobCreatePayload,
  JobDetail,
  JobPostingType,
  JobSearchResponse,
  JobSort,
  JobSortDirection,
  JobSourceOption,
  JobUpdatePayload,
  PublicJobStatus,
} from '../model/types';

const BASE_PATH = '/api/v1/jobs';
const ADMIN_BASE_PATH = '/api/v1/admin/jobs';

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

export interface FetchAdminJobListParams {
  /** 제목 부분 일치. */
  query?: string;
  /** 미지정 시 삭제(DELETED) 공고는 제외된다. */
  status?: AdminJobStatus;
  page?: number;
  size?: number;
}

/**
 * `GET /api/v1/admin/jobs`(GETI-Server-V1 #304, `JobAdminController`) — 관리자 공고 목록.
 * 공개 검색과 달리 DRAFT·DELETED까지 조회되고 정렬은 서버 고정(`createdAt DESC, id DESC`)이라
 * 클라이언트 `sort`는 무시된다. 교사·개발자 권한 전용.
 */
export async function fetchAdminJobList(
  params: FetchAdminJobListParams = {},
): Promise<AdminJobSearchResponse> {
  const { data } = await api.get<ApiResponse<AdminJobSearchResponse>>(ADMIN_BASE_PATH, {
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

/**
 * `GET /api/v1/admin/jobs/{jobId}`(GETI-Server `JobAdminController`) — 관리자 공고 상세 조회.
 * 임시저장·삭제 공고까지 모든 상태를 조회하고, 공개 상세와 달리 조회수를 올리지 않는다.
 * 교사·개발자 권한이 필요하다.
 */
export async function fetchAdminJobDetail(jobId: number): Promise<AdminJobDetail> {
  const { data } = await api.get<ApiResponse<AdminJobDetail>>(`${ADMIN_BASE_PATH}/${jobId}`);
  return data.data;
}

/**
 * `PATCH /api/v1/admin/jobs/{jobId}/status`(`JobAdminController`) — 공고 상태 변경.
 * 허용 전이는 DRAFT→PUBLISHED|DELETED, PUBLISHED→CLOSED|DELETED, CLOSED→DELETED뿐이고
 * 그 외(동일 상태 포함)는 409로 거부된다. 이 클라이언트는 공개(PUBLISHED)·마감(CLOSED) 공고만
 * 다루므로 `CLOSED`(마감)·`DELETED`(삭제, Soft Delete — 기존 지원·북마크 이력 보존)만 호출한다.
 */
export async function changeAdminJobStatus(
  jobId: number,
  status: 'CLOSED' | 'DELETED',
): Promise<AdminJobDetail> {
  const { data } = await api.patch<ApiResponse<AdminJobDetail>>(
    `${ADMIN_BASE_PATH}/${jobId}/status`,
    { status },
  );
  return data.data;
}

/**
 * `POST /api/v1/jobs/{jobId}/ai-reanalysis`(`JobAiReanalysisController`) — AI 공고 분석 수동
 * 재요청. 202로 즉시 접수만 되고, 실제 결과는 이후 `GET /api/v1/admin/jobs/{jobId}`의
 * `aiAnalysis`로 확인한다. 게시 전 공고면 404, 이미 분석 중이면 409, 3회 소진이면 429,
 * AI 연동 미설정이면 503.
 */
export async function reanalyzeAdminJob(jobId: number): Promise<void> {
  await api.post(`${BASE_PATH}/${jobId}/ai-reanalysis`);
}

/**
 * `POST /api/v1/admin/jobs`(`JobAdminController`) — 공고 등록·임시저장. `status = PUBLISHED`면
 * 서버가 게시 필수값(본문·외부 URL 등)을 검증해 `JOB_VALIDATION_FAILED`/`JOB_FORM_REQUIRED`로
 * 거부할 수 있다. 응답은 방금 만든 공고의 관리자 상세다(201).
 */
export async function createAdminJob(payload: JobCreatePayload): Promise<AdminJobDetail> {
  const { data } = await api.post<ApiResponse<AdminJobDetail>>(ADMIN_BASE_PATH, payload);
  return data.data;
}

/**
 * `PATCH /api/v1/admin/jobs/{jobId}`(`JobAdminController`) — 공고 내용 부분 수정. 전달한 필드만
 * 반영된다. 이미 게시된 공고를 수정하면 결과가 게시 필수값을 계속 만족하는지 서버가 다시 검증한다.
 */
export async function updateAdminJob(
  jobId: number,
  payload: JobUpdatePayload,
): Promise<AdminJobDetail> {
  const { data } = await api.patch<ApiResponse<AdminJobDetail>>(
    `${ADMIN_BASE_PATH}/${jobId}`,
    payload,
  );
  return data.data;
}

interface PublicJobSourceListResponse {
  sources: JobSourceOption[];
}

/**
 * `GET /api/v1/job-sources`(GETI-Server `JobSourceController`) — 공고 목록 "출처" 필터
 * 드롭다운의 선택지 조회. `activeOnly=true`로 비활성 수집원은 제외한다(GETI-Server-V1 #222).
 */
export async function fetchJobSources(): Promise<JobSourceOption[]> {
  const { data } = await api.get<ApiResponse<PublicJobSourceListResponse>>('/api/v1/job-sources', {
    params: { activeOnly: true },
  });
  return data.data.sources;
}

/**
 * `GET /api/v1/files/{fileId}/download`(GETI-Server `FileController`) — 첨부파일 다운로드.
 * `JobAttachment.downloadUrl`은 presigned Storage URL이 아니라 이 GETI 자체 API 경로라 인증이
 * 필요하다(GETI-Server `JobServiceImpl` — `downloadUrl = "/api/v1/files/$fileId/download"`).
 * `shared/api`의 axios 인스턴스를 통해 요청해야 Authorization Header가 붙는다. 실제 응답은
 * Storage URL로의 302 Redirect라 axios가 그 Redirect를 따라간 뒤의 Binary Body를 Blob으로 받는다.
 */
export async function downloadJobAttachment(downloadUrl: string): Promise<Blob> {
  const response = await api.get<Blob>(downloadUrl, { responseType: 'blob' });
  return response.data;
}
