'use client';

import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  FetchPortfolioRequestListParams,
  PortfolioSubmissionUpsertRequest,
} from '../model/types';
import {
  fetchAllPortfolioRequestList,
  fetchPortfolioRequestDetail,
  fetchPortfolioRequestList,
  upsertPortfolioSubmission,
} from './portfolioRequestApi';

export const portfolioRequestKeys = {
  all: ['portfolio-requests'] as const,
  details: () => [...portfolioRequestKeys.all, 'detail'] as const,
  detail: (requestId: number) => [...portfolioRequestKeys.details(), requestId] as const,
  lists: () => [...portfolioRequestKeys.all, 'list'] as const,
  list: (params: FetchPortfolioRequestListParams) =>
    [...portfolioRequestKeys.lists(), params] as const,
  catalogs: () => [...portfolioRequestKeys.all, 'catalog'] as const,
  catalog: (size: number) => [...portfolioRequestKeys.catalogs(), size] as const,
};

export function usePortfolioRequestListQuery(params: FetchPortfolioRequestListParams = {}) {
  return useQuery({
    queryKey: portfolioRequestKeys.list(params),
    queryFn: () => fetchPortfolioRequestList(params),
    placeholderData: keepPreviousData,
  });
}

export function useAllPortfolioRequestListQuery(size = 20) {
  return useQuery({
    queryKey: portfolioRequestKeys.catalog(size),
    queryFn: () => fetchAllPortfolioRequestList(size),
  });
}

export function usePortfolioRequestDetailQuery(requestId: number | null) {
  return useQuery({
    queryKey: portfolioRequestKeys.detail(requestId ?? -1),
    queryFn: requestId === null ? skipToken : () => fetchPortfolioRequestDetail(requestId),
  });
}

export function useUpsertPortfolioSubmissionMutation(requestId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PortfolioSubmissionUpsertRequest) => {
      if (requestId === null) return Promise.reject(new Error('잘못된 포트폴리오 요청입니다.'));
      return upsertPortfolioSubmission(requestId, request);
    },
    onSuccess: () => {
      if (requestId === null) return;
      queryClient.invalidateQueries({ queryKey: portfolioRequestKeys.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: portfolioRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: portfolioRequestKeys.catalogs() });
    },
  });
}
