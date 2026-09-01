import { api, type ApiResponse } from '@/shared/api';

import type {
  FetchPortfolioRequestListParams,
  PortfolioRequestDetailApiResponse,
  PortfolioRequestListApiResponse,
  PortfolioRequestSummaryApiResponse,
  PortfolioSubmissionApiResponse,
  PortfolioSubmissionUpsertRequest,
} from '../model/types';

const PORTFOLIO_REQUESTS_PATH = '/api/v1/portfolio-requests';

export async function fetchPortfolioRequestList(
  params: FetchPortfolioRequestListParams = {},
): Promise<PortfolioRequestListApiResponse> {
  const { data } = await api.get<ApiResponse<PortfolioRequestListApiResponse>>(
    PORTFOLIO_REQUESTS_PATH,
    {
      params: { page: 0, size: 20, ...params },
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
