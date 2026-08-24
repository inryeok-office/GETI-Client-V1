import { api, type ApiResponse } from '@/shared/api';

import type {
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
