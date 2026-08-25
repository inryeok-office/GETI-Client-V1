import { api, type ApiResponse } from '@/shared/api';

import type {
  AdminCompanyDetailRecord,
  AdminCompanyListResponse,
  AdminCompanyRecord,
  AdminCompanyType,
  MouStatus,
} from '../model/types';

const BASE_PATH = '/api/v1/companies';
const ADMIN_BASE_PATH = '/api/v1/admin/companies';

export interface FetchCompanyListParams {
  query?: string;
  companyType?: AdminCompanyType;
  mouStatus?: MouStatus;
  sourceName?: string;
  page?: number;
  size?: number;
}

/** `GET /api/v1/companies` — 기업 검색·목록 조회. */
export async function fetchCompanyList(
  params: FetchCompanyListParams = {},
): Promise<AdminCompanyListResponse> {
  const { data } = await api.get<ApiResponse<AdminCompanyListResponse>>(BASE_PATH, {
    params: { page: 0, size: 20, ...params },
  });
  return data.data;
}

/** `GET /api/v1/companies/{id}` — 기업 상세 조회. 수정 패널을 채울 때 쓴다(목록 응답엔 없는 필드가 많다). */
export async function fetchCompanyDetail(companyId: number): Promise<AdminCompanyRecord> {
  const { data } = await api.get<ApiResponse<AdminCompanyRecord>>(`${BASE_PATH}/${companyId}`);
  return data.data;
}

/**
 * `GET /api/v1/admin/companies/{id}` — 어드민 기업 상세 조회. 연락처 · 메모 · 통계 · 연결된
 * 공고 · 감사 로그까지 포함한 응답으로, 위 학생·목록용 상세(`fetchCompanyDetail`)와는 다른
 * 엔드포인트다(Issue #167).
 */
export async function fetchAdminCompanyDetail(
  companyId: number,
): Promise<AdminCompanyDetailRecord> {
  const { data } = await api.get<ApiResponse<AdminCompanyDetailRecord>>(
    `${ADMIN_BASE_PATH}/${companyId}`,
  );
  return data.data;
}

export interface CompanyMutationPayload {
  name: string;
  companyType: AdminCompanyType;
  mouStatus: MouStatus;
  sourceName?: string | null;
  homepageUrl?: string | null;
  description?: string | null;
  /** `yyyy-MM-dd`. */
  mouStartDate?: string | null;
  /** `yyyy-MM-dd`. */
  mouEndDate?: string | null;
  /** 관리자 전용 내부 메모. */
  memo?: string | null;
}

/** `POST /api/v1/admin/companies` — 기업 등록. */
export async function createCompany(payload: CompanyMutationPayload): Promise<AdminCompanyRecord> {
  const { data } = await api.post<ApiResponse<AdminCompanyRecord>>(ADMIN_BASE_PATH, payload);
  return data.data;
}

export interface UpdateCompanyParams {
  companyId: number;
  /** 전달하지 않은 필드는 서버가 기존 값을 그대로 유지한다(PATCH). */
  payload: Partial<CompanyMutationPayload>;
}

/** `PATCH /api/v1/admin/companies/{id}` — 기업 부분 수정. */
export async function updateCompany({
  companyId,
  payload,
}: UpdateCompanyParams): Promise<AdminCompanyRecord> {
  const { data } = await api.patch<ApiResponse<AdminCompanyRecord>>(
    `${ADMIN_BASE_PATH}/${companyId}`,
    payload,
  );
  return data.data;
}

export interface CompanyOption {
  companyId: number;
  name: string;
}

interface CompanySummaryResponse {
  companyId: number;
  name: string;
}

interface CompanySearchResponse {
  content: CompanySummaryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

const COMPANY_PAGE_SIZE = 100;

async function fetchCompanyPage(page: number): Promise<CompanySearchResponse> {
  const { data } = await api.get<ApiResponse<CompanySearchResponse>>(BASE_PATH, {
    params: { page, size: COMPANY_PAGE_SIZE },
  });
  return data.data;
}

/**
 * 지원자 관리 화면의 "기업" 드롭다운 선택지를 만들기 위해 `GET /api/v1/companies`를 `totalPages`
 * 끝까지 순회해 전체 기업을 모은다. entities/applicant의 `fetchAllJobPostings`와 같은 이유로
 * 페이지 크기가 아니라 상한 없이 모든 페이지를 모은다(어드민 화면이라 트래픽 부담은 크지 않다).
 */
export async function fetchAllCompanyOptions(): Promise<CompanyOption[]> {
  const first = await fetchCompanyPage(0);
  const restPages = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) => fetchCompanyPage(index + 1)),
  );

  return [first, ...restPages].flatMap(({ content }) =>
    content.map((company) => ({ companyId: company.companyId, name: company.name })),
  );
}
