import { api, type ApiResponse } from '@/shared/api';

const BASE_PATH = '/api/v1/companies';

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
