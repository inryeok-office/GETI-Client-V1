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

export type JobSort = 'LATEST' | 'DEADLINE' | 'VIEWS';
export type JobSortDirection = 'ASC' | 'DESC';

export interface JobCompanySummary {
  companyId: number;
  name: string;
  /** presigned URL. 만료될 수 있다. */
  logoUrl: string | null;
}

/** 지원 가능 여부 스냅샷. 목록·상세 응답에 공통으로 포함된다. */
export interface JobApplicationEligibility {
  canApply: boolean;
  eligibilityReason: string;
  eligibilityMessage: string;
  applicationId: number | null;
  applicationStatus: string | null;
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

/** 공고 상세에 첨부된 파일. `JobDetailResponse`에 대응 필드가 아직 없어 항상 빈 배열이다(Issue #122). */
export interface JobAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
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
}
