/** 공고 출처. 어드민에서 직접 등록(internal), 학교 등록(school), 외부 기업 등록(external)으로 구분한다. */
export type JobSource = 'internal' | 'school' | 'external';

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

/** 공고 상세에 첨부된 파일. */
export interface JobAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
}

/** AI 공고 분석 진행 상태. */
export type AiAnalysisStatus = 'pending' | 'done' | 'failed';

export interface AiAnalysis {
  status: AiAnalysisStatus;
  /** 상태 배지 문구를 기본값("분석중"/"분석 완료"/"분석 실패") 대신 다른 문구로 바꾼다(예: "재분석 중"). */
  statusLabel?: string;
  /** pending · failed 상태에서 보여줄 제목(예: "AI가 공고를 분석하고 있습니다."). */
  title?: string;
  /** pending · failed 상태에서 보여줄 설명(예: "잠시만 기다려주세요."). */
  description?: string;
  /** done 상태일 때만 의미 있는 나머지 필드. */
  keySummary?: string;
  requiredTools?: string[];
  preferredSkills?: string[];
  fitTags?: string[];
  difficulty?: string;
}

/** 학교 · 외부 공고 상세가 공통으로 가지는 필드. */
export interface JobDetailBase {
  id: string;
  title: string;
  organizationName: string;
  organizationDescription: string;
  viewCount: number;
  applyStartDate: string;
  applyEndDate: string;
  dDayLabel: string;
  /** 지원 유형(예: "외부 지원", "교내 지원서 작성"). */
  applyType: string;
  introduction: string;
  responsibilities: string[];
  requirements: string[];
  preferences: string[];
  workConditions: string[];
  hiringProcess: string[];
  attachments: JobAttachment[];
  aiAnalysis: AiAnalysis;
}

/**
 * 지원 가능 여부. 지원 정보 박스의 배지 색상 · 지원 버튼 활성화 여부 · 안내 문구를 함께 결정한다.
 * beforePeriod는 안내 문구에 모집 시작일(`applyStartDate`)을 그대로 사용한다.
 */
export type ApplyEligibility =
  'available' | 'ineligible' | 'beforePeriod' | 'closed' | 'alreadyApplied';

export interface SchoolJobDetail extends JobDetailBase {
  source: 'school';
  /** 지원 대상(예: "OO고 3학년 재학생"). */
  applyTarget: string;
  /** 지원 가능 여부. */
  applyEligibility: ApplyEligibility;
  /** 공고를 확인할 수 없는 경우(비공개 · 삭제)의 사유. 정상 공고는 null. */
  unavailableReason: '비공개' | '삭제' | null;
}

export interface ExternalJobDetail extends JobDetailBase {
  source: 'external';
  isClosed: boolean;
  /** 공고 출처(예: "네이버 채용"). */
  sourceLabel: string;
  /** 원문 채용 페이지 URL. 확인할 수 없는 경우 null. */
  originalUrl: string | null;
}
