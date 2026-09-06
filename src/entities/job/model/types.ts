/** 채용 공고 목록 카드에 필요한 최소 정보. */
export interface JobListItem {
  id: string;
  companyName: string;
  title: string;
  /** 배지 문구를 결정한다("학교"/"외부"). 마감된 공고는 isClosed가 우선해서 "마감"으로 대체된다. */
  source: 'school' | 'external';
  /** 배지 옆에 붙는 보조 설명(예: "MOU · 교내 모집", "외부 공고 · 카카오 채용"). */
  subLabel: string;
  location: string;
  /** 고용 형태(예: "인턴", "정규직"). */
  employmentType: string;
  /** 마감까지 남은 일수. 상시 채용이거나 마감된 공고는 null. */
  dDay: number | null;
  deadlineLabel: string;
  /** 모집이 종료된 공고. 카드가 흐리게 표시되고 배지가 "마감"으로, D-day 자리에 "마감"이 뜬다. */
  isClosed: boolean;
  isBookmarked: boolean;
  /** 카드 클릭 시 이동할 상세 페이지 경로. 출처(학교/외부)에 따라 다른 라우트를 가리킨다. */
  detailHref: string;
}

/** `GET /api/v1/jobs`(GETI-Server `JobSearchController`)의 공고 유형. */
export type JobPostingType = 'GENERAL' | 'MOU' | 'SCHOOL';

/** 지원 방식. 학교 내부 지원서(INTERNAL)인지 외부 채용 페이지(EXTERNAL)인지 — 목록 카드의 "학교"/"외부" 배지를 여기서 결정한다. */
export type JobApplicationMethod = 'INTERNAL' | 'EXTERNAL';

/** 공개 목록 조회에서 필터로 받는 상태. 관리자 전용(DRAFT/DELETED)은 여기 없다. */
export type PublicJobStatus = 'PUBLISHED' | 'CLOSED';

/**
 * 관리자 상세(`GET /api/v1/admin/jobs/{jobId}`)가 반환하는 전체 상태(`JobStatus`).
 * 공개 목록·상세와 달리 임시저장·삭제 공고까지 조회된다.
 */
export type AdminJobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'DELETED';

export type JobSort = 'LATEST' | 'DEADLINE' | 'VIEWS';
export type JobSortDirection = 'ASC' | 'DESC';

/**
 * `GET /api/v1/job-sources`(`PublicJobSourceResponse`)의 출처 옵션. `sourceCode`가
 * `GET /api/v1/jobs`의 `sourceName` 파라미터와 정확히 일치하는 값이다(GETI-Server-V1 #222).
 */
export interface JobSourceOption {
  sourceId: number;
  sourceCode: string;
  name: string;
  active: boolean;
}

export interface JobCompanySummary {
  companyId: number;
  name: string;
  /** presigned URL. 만료될 수 있다. */
  logoUrl: string | null;
}

/**
 * 지원 불가 사유(`JobApplicationEligibilityReason`, GETI-Server-V1
 * `domain.application.entity.type.JobApplicationEligibilityReason`). 값 8개는 백엔드 소스로 확인했다.
 */
export type JobApplicationEligibilityReason =
  | 'AVAILABLE'
  | 'NOT_INTERNAL'
  | 'NOT_ENROLLED'
  | 'NOT_TARGET_GRADE'
  | 'BEFORE_START'
  | 'AFTER_END'
  | 'ALREADY_APPLIED'
  | 'JOB_NOT_PUBLISHED';

/**
 * `applicationStatus`에 실제로 나타나는 지원서 상태(`JobApplicationStatus`, GETI-Server-V1
 * `domain.application.entity.type.JobApplicationStatus`). 전체 Enum은 이 6개 외에 REJECTED ·
 * FORWARDED · WITHDRAWN도 있지만, 이 필드는 "활성" 지원서(`ACTIVE_JOB_APPLICATION_STATUSES`,
 * `JobApplicationEligibility.kt`)가 있을 때만 채워져 그 셋은 여기 나타나지 않는다
 * (취소·반려 후에는 활성 지원서가 없어 재지원할 수 있고, 그때 이 필드는 null이다).
 */
export type ActiveJobApplicationStatus =
  'DRAFT' | 'SUBMITTED' | 'EDIT_REQUESTED' | 'EDIT_ALLOWED' | 'REVISION_REQUESTED' | 'APPROVED';

/** 지원 가능 여부 스냅샷. 목록·상세 응답에 공통으로 포함된다. */
export interface JobApplicationEligibility {
  canApply: boolean;
  eligibilityReason: JobApplicationEligibilityReason;
  eligibilityMessage: string;
  applicationId: number | null;
  applicationStatus: ActiveJobApplicationStatus | null;
  availableActions: string[];
}

/** `GET /api/v1/jobs` 목록 항목(`JobSummaryResponse`). */
export interface JobSummary {
  jobId: number;
  title: string;
  postingType: JobPostingType;
  applicationMethod: JobApplicationMethod;
  status: PublicJobStatus;
  /** 공고 등록 후 기업이 삭제되면 null. */
  company: JobCompanySummary | null;
  startDate: string | null;
  /** 마감일. null이면 상시 채용(마감 없음). */
  endDate: string | null;
  targetGrade: number | null;
  capacity: number | null;
  location: string | null;
  employmentType: string | null;
  firstComeServed: boolean;
  viewCount: number;
  publishedAt: string | null;
  application: JobApplicationEligibility;
  bookmarked: boolean;
}

export interface JobSearchResponse {
  content: JobSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * `GET /api/v1/admin/jobs` 목록 항목(`JobAdminListItemResponse`, GETI-Server-V1 #304).
 * 공개 검색 목록(`JobSummary`)과 달리 DRAFT·DELETED까지 모든 상태가 나오고, 대신 공개용
 * 필드(`viewCount`·`publishedAt`·`targetGrade`·`capacity`·`bookmarked` 등)는 없다.
 */
export interface AdminJobSummary {
  jobId: number;
  title: string;
  /** 공고 등록 후 기업이 삭제되면 null. */
  company: JobCompanySummary | null;
  postingType: JobPostingType;
  applicationMethod: JobApplicationMethod;
  status: AdminJobStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminJobSearchResponse {
  content: AdminJobSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * 공고 상세에 첨부된 파일(`JobFileResponse`, GETI-Server-V1 Issue #126). `downloadUrl`은
 * presigned Storage URL이 아니라 인증이 필요한 GETI 자체 다운로드 API 경로다
 * (`/api/v1/files/{fileId}/download`, GETI-Server `JobServiceImpl`). `AttachmentList`가
 * `shared/api` axios 인스턴스로 이 경로를 요청해 Blob으로 저장한다(실패를 감지해 토스트로
 * 알리기 위해, `<a href>` 새 창 이동 대신 이 방식을 쓴다).
 */
export interface JobAttachment {
  fileId: number;
  originalName: string;
  contentType: string;
  size: number;
  downloadUrl: string;
}

export type JobAiAnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type AiFitLevel = 'SUITABLE' | 'CONDITIONAL' | 'UNSUITABLE';
export type AiDifficulty = 'EASY' | 'NORMAL' | 'HARD';

export interface JobAiSkill {
  techStackId: number | null;
  name: string;
}

/** `JobDetailResponse.aiAnalysis`. 분석이 아직 시작되지 않았으면 응답 자체가 null이다. */
export interface JobAiAnalysis {
  status: JobAiAnalysisStatus;
  isReanalysis: boolean;
  summary: string | null;
  requiredSkills: JobAiSkill[];
  preferredSkills: JobAiSkill[];
  highSchoolGraduateFit: AiFitLevel | null;
  entryLevelFit: AiFitLevel | null;
  difficulty: AiDifficulty | null;
  canReanalyze: boolean;
  remainingReanalysisCount: number;
  analyzedAt: string | null;
}

/**
 * `GET /api/v1/jobs/{jobId}`(`JobDetailResponse`) 상세 응답.
 * `content`는 "공고 소개 · 주요 업무 · 자격 요건 · ..."로 나뉜 구조화된 필드가 아니라
 * 마크다운 본문 하나다 — 섹션을 나누는 확정된 규칙이 없어 그대로 렌더링한다(Issue #122).
 */
export interface JobDetail {
  jobId: number;
  title: string;
  postingType: JobPostingType;
  applicationMethod: JobApplicationMethod;
  status: PublicJobStatus;
  company: JobCompanySummary | null;
  content: string | null;
  /** EXTERNAL일 때만 값이 있을 수 있다. */
  externalUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  targetGrade: number | null;
  capacity: number | null;
  location: string | null;
  employmentType: string | null;
  firstComeServed: boolean;
  viewCount: number;
  publishedAt: string | null;
  closedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  aiAnalysis: JobAiAnalysis | null;
  application: JobApplicationEligibility;
  bookmarked: boolean;
  /** 공고가 PUBLISHED/CLOSED 상태일 때만 채워진다(GETI-Server-V1 Issue #126 응답 설명). */
  files: JobAttachment[];
}

/**
 * `GET /api/v1/admin/jobs/{jobId}`(GETI-Server `JobAdminController`) 관리자 상세 응답.
 * 공개 상세(`JobDetail`)와 같은 `JobDetailResponse` DTO지만 `status`가 임시저장·삭제까지
 * 포함하고, 조회수를 올리지 않는다.
 */
export interface AdminJobDetail extends Omit<JobDetail, 'status'> {
  status: AdminJobStatus;
}

/**
 * `POST /api/v1/admin/jobs`(`JobCreateRequest`) 요청 Body. `status`는 DRAFT(임시저장) 또는
 * PUBLISHED(게시)만 — CLOSED·DELETED는 상태 변경 API를 쓴다. Discord 채널(`discordChannelKey`)·
 * 첨부파일(`fileIds`)은 이 클라이언트에서 다루지 않아 생략한다(서버는 기본 채널을 쓰고 첨부는 없음).
 * 날짜는 `LocalDateTime` 문자열(`2026-08-01T00:00:00`).
 */
export interface JobCreatePayload {
  companyId: number;
  postingType: JobPostingType;
  applicationMethod: JobApplicationMethod;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  content?: string | null;
  externalUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  targetGrade?: number | null;
  capacity?: number | null;
  location?: string | null;
  employmentType?: string | null;
  firstComeServed?: boolean;
}

/**
 * `PATCH /api/v1/admin/jobs/{jobId}`(`JobUpdateRequest`) 요청 Body. 전달한 필드만 반영되고
 * 생략하면 기존 값을 유지한다 — 서버가 "값 비우기"를 지원하지 않아, 빈 선택 필드는 보내지 않는다.
 * 기업·공고 유형·지원 방식·상태는 이 API로 못 바꾼다(상태는 별도 API).
 */
export interface JobUpdatePayload {
  title?: string;
  content?: string | null;
  externalUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  targetGrade?: number | null;
  capacity?: number | null;
  location?: string | null;
  employmentType?: string | null;
  firstComeServed?: boolean;
}
