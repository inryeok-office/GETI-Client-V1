import { api, type ApiResponse } from '@/shared/api';

import type {
  CreateAdminPortfolioRequestRequest,
  DownloadAdminPortfolioSubmissionsVariables,
  FetchAdminPortfolioRequestListParams,
  FetchAdminPortfolioSubmissionsParams,
  FetchPortfolioRequestListParams,
  PortfolioApiRequestStatus,
  PortfolioRequestDetailApiResponse,
  PortfolioRequestListApiResponse,
  PortfolioRequestResponse,
  PortfolioRequestSummaryResponse,
  PortfolioRequestSummaryApiResponse,
  PortfolioSubmissionApiResponse,
  PortfolioSubmissionStatusListApiResponse,
  PortfolioSubmissionUpsertRequest,
  UpdateAdminPortfolioRequestStatusVariables,
  UpdateAdminPortfolioRequestVariables,
} from '../model/types';

const PORTFOLIO_REQUESTS_PATH = '/api/v1/portfolio-requests';
const ADMIN_PORTFOLIO_REQUESTS_PATH = '/api/v1/admin/portfolio-requests';

export async function fetchPortfolioRequestList(
  params: FetchPortfolioRequestListParams = {},
  signal?: AbortSignal,
): Promise<PortfolioRequestListApiResponse> {
  const { data } = await api.get<ApiResponse<PortfolioRequestListApiResponse>>(
    PORTFOLIO_REQUESTS_PATH,
    {
      params: { page: 0, size: 20, ...params },
      ...(signal ? { signal } : {}),
    },
  );
  return data.data;
}

export async function fetchAllPortfolioRequestList(
  size = 20,
): Promise<PortfolioRequestSummaryApiResponse[]> {
  const requests: PortfolioRequestSummaryApiResponse[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const response = await fetchPortfolioRequestList({ page, size });
    requests.push(...response.content);
    totalPages = response.totalPages;
    page += 1;
  }

  return requests;
}

export async function fetchPortfolioRequestDetail(
  requestId: number,
): Promise<PortfolioRequestDetailApiResponse> {
  const { data } = await api.get<ApiResponse<PortfolioRequestDetailApiResponse>>(
    `${PORTFOLIO_REQUESTS_PATH}/${requestId}`,
  );
  return data.data;
}

export async function upsertPortfolioSubmission(
  requestId: number,
  request: PortfolioSubmissionUpsertRequest,
): Promise<PortfolioSubmissionApiResponse> {
  const { data } = await api.patch<ApiResponse<PortfolioSubmissionApiResponse>>(
    `${PORTFOLIO_REQUESTS_PATH}/${requestId}/submission`,
    request,
  );
  return data.data;
}

export async function fetchAdminPortfolioRequestList(
  params: FetchAdminPortfolioRequestListParams = {},
  signal?: AbortSignal,
): Promise<PortfolioRequestListApiResponse> {
  return fetchPortfolioRequestList(params, signal);
}

export async function fetchAllAdminPortfolioRequestList(
  status?: PortfolioApiRequestStatus,
  size = 20,
  signal?: AbortSignal,
): Promise<PortfolioRequestSummaryResponse[]> {
  const requests: PortfolioRequestSummaryResponse[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const response = await fetchAdminPortfolioRequestList({ page, size, status }, signal);
    requests.push(...response.content);
    totalPages = response.totalPages;
    page += 1;
  }

  return requests;
}

export async function createAdminPortfolioRequest(
  request: CreateAdminPortfolioRequestRequest,
): Promise<PortfolioRequestResponse> {
  const { data } = await api.post<ApiResponse<PortfolioRequestResponse>>(
    ADMIN_PORTFOLIO_REQUESTS_PATH,
    request,
  );
  return data.data;
}

export async function updateAdminPortfolioRequest({
  request,
  requestId,
}: UpdateAdminPortfolioRequestVariables): Promise<PortfolioRequestResponse> {
  const { data } = await api.patch<ApiResponse<PortfolioRequestResponse>>(
    `${ADMIN_PORTFOLIO_REQUESTS_PATH}/${requestId}`,
    request,
  );
  return data.data;
}

export async function updateAdminPortfolioRequestStatus({
  requestId,
  status,
}: UpdateAdminPortfolioRequestStatusVariables): Promise<PortfolioRequestResponse> {
  const { data } = await api.patch<ApiResponse<PortfolioRequestResponse>>(
    `${ADMIN_PORTFOLIO_REQUESTS_PATH}/${requestId}/status`,
    { status },
  );
  return data.data;
}

export async function fetchAdminPortfolioSubmissions(
  requestId: number,
  params: FetchAdminPortfolioSubmissionsParams = {},
): Promise<PortfolioSubmissionStatusListApiResponse> {
  const { data } = await api.get<ApiResponse<PortfolioSubmissionStatusListApiResponse>>(
    `${ADMIN_PORTFOLIO_REQUESTS_PATH}/${requestId}/submissions`,
    { params: { page: 0, size: 20, ...params } },
  );
  return data.data;
}

export async function downloadAdminPortfolioSubmissions({
  requestId,
  submittedOnly = false,
}: DownloadAdminPortfolioSubmissionsVariables): Promise<Blob> {
  const response = await api.get<Blob>(
    `${ADMIN_PORTFOLIO_REQUESTS_PATH}/${requestId}/submissions/export`,
    {
      params: { submittedOnly },
      responseType: 'blob',
    },
  );
  return response.data;
}
