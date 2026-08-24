/** 어드민 기업 관리 목록의 기업 유형. GETI-Server `CompanyType`과 동일한 값을 쓴다. */
export type AdminCompanyType =
  'ETC' | 'FOREIGN' | 'GENERAL' | 'PUBLIC_ENTERPRISE' | 'PUBLIC_INSTITUTION';

/**
 * 기업 목록 카드에 필요한 최소 정보.
 * "규모"(대기업 · 중견 · 중소) 배지는 서버에 대응 필드가 없어 뺐다 — `companyType` 라벨로
 * 대체한다. "채용 중인 공고 수"도 회사-공고 연결 조회 API가 없어 이번 범위에서 뺐다
 * (Issue #156 코드 리뷰 · 사용자 확인 완료).
 */
export interface CompanyListItem {
  id: string;
  name: string;
  /** 학교 MOU 체결 기업 여부. true면 "MOU 기업" 배지가 붙는다(`mouStatus === 'ACTIVE'`). */
  isMou: boolean;
  companyType: AdminCompanyType;
  /** 카드 클릭 시 이동할 기업 상세 페이지 경로. */
  detailHref: string;
}

/**
 * 기업 상세 화면에 필요한 정보. 비공개 · 삭제 여부는 데이터가 아니라 조회 상태
 * (`CompanyDetailStatus`의 `unavailable`)로 표현한다 — 서버가 삭제된 기업을 404
 * (`COMPANY_NOT_FOUND`)로만 응답하고 비공개를 구분해 주지 않아, 정상 조회된 값에
 * "비공개일 수도 있다"는 필드를 남겨둘 이유가 없다(Issue #156 사용자 확인 완료).
 */
export interface CompanyDetail {
  id: string;
  name: string;
  /** 학교 MOU 체결 기업 여부. true면 "MOU 기업" 배지가 붙는다(`mouStatus === 'ACTIVE'`). */
  isMou: boolean;
  companyType: AdminCompanyType;
  /** 업종(예: "IT 서비스"). */
  industry: string;
  address: string;
  introduction: string;
  /** 기업 홈페이지 URL. */
  homepageUrl: string;
}

/** 기업 정보 출처. */
export type CompanyInfoSource = 'direct' | 'external';

/** MOU 협약 상태. GETI-Server `MouStatus`와 동일한 값을 쓴다. */
export type MouStatus = 'ACTIVE' | 'EXPIRED' | 'NONE' | 'TERMINATED';

/** `GET /api/v1/companies` 목록 항목(`CompanySummaryResponse`)과 동일하다. */
export interface AdminCompanyListItem {
  companyId: number;
  name: string;
  companyType: AdminCompanyType;
  mouStatus: MouStatus;
  logoUrl: string | null;
}

/** `GET /api/v1/companies` 응답(`CompanySearchResponse`)과 동일하다. */
export interface AdminCompanyListResponse {
  content: AdminCompanyListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * `POST /api/v1/admin/companies` · `PATCH /api/v1/admin/companies/{id}` ·
 * `GET /api/v1/companies/{id}` 공통 응답(`CompanyResponse`)과 동일하다.
 */
export interface AdminCompanyRecord {
  companyId: number;
  name: string;
  companyType: AdminCompanyType;
  mouStatus: MouStatus;
  sourceName: string | null;
  homepageUrl: string | null;
  logoUrl: string | null;
  description: string | null;
  industry: string | null;
  address: string | null;
  /** `yyyy-MM-dd` 형식(서버 컬럼이 `DATE`라 시각 정보가 없다). */
  mouStartDate: string | null;
  mouEndDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 어드민 기업 상세 화면의 기본 정보 · MOU 정보 · 메모. */
export interface AdminCompanyDetail {
  id: string;
  name: string;
  type: AdminCompanyType;
  representativeEmail: string;
  representativePhone: string;
  address: string;
  infoSource: CompanyInfoSource;
  /** 등록일(예: "2025.02.12"). */
  registeredAt: string;
  lastEditedBy: string;
  /** 마지막 수정 일시(예: "2026.08.05 14:32"). */
  lastEditedAt: string;
  mouStatus: MouStatus;
  /** MOU 체결 기간(예: "2025.03.01 ~ 2027.02.28"). 미체결 · 만료면 null. */
  mouPeriod: string | null;
  /** MOU 종료일까지 남은 일수. 미체결 · 만료면 null. */
  mouDaysLeft: number | null;
  memo: string;
}

/** 어드민 기업 상세에 연결된 공고의 유형(예: "MOU 공고", "학교 공고"). */
export type AdminCompanyJobConnectionType = string;

/** 어드민 기업 상세에 연결된 공고의 모집 상태. */
export type AdminCompanyJobStatus = 'closed' | 'open' | 'reviewing';

/** 어드민 기업 상세 "연결된 공고" 표의 한 행. */
export interface AdminCompanyConnectedJob {
  id: string;
  title: string;
  type: AdminCompanyJobConnectionType;
  status: AdminCompanyJobStatus;
  applicantCount: number;
  /** "상세 보기" 클릭 시 이동할 경로. */
  detailHref: string;
}

/** 어드민 기업 상세 "연결 현황" 통계. */
export interface AdminCompanyStats {
  totalConnectedJobs: number;
  activeJobCount: number;
  totalApplicationCount: number;
}

/** 어드민 기업 상세 "최근 변경" 타임라인의 한 항목. */
export interface AdminCompanyAuditLogEntry {
  id: string;
  title: string;
  /** 예: "2026.08.05 14:32 · 이름". */
  actedAtWithActor: string;
}
