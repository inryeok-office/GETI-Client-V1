'use client';

import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  CreateAdminPortfolioRequestRequest,
  DownloadAdminPortfolioSubmissionsVariables,
  FetchAdminPortfolioSubmissionsParams,
  FetchPortfolioRequestListParams,
  PortfolioApiRequestStatus,
  PortfolioSubmissionUpsertRequest,
  UpdateAdminPortfolioRequestStatusVariables,
  UpdateAdminPortfolioRequestVariables,
} from '../model/types';
import {
  createAdminPortfolioRequest,
  downloadAdminPortfolioSubmissions,
  fetchAdminPortfolioSubmissions,
  fetchAllAdminPortfolioRequestList,
  fetchAllPortfolioRequestList,
  fetchPortfolioRequestDetail,
  fetchPortfolioRequestList,
  upsertPortfolioSubmission,
  updateAdminPortfolioRequest,
  updateAdminPortfolioRequestStatus,
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
  adminCatalogs: () => [...portfolioRequestKeys.all, 'admin-catalog'] as const,
  adminCatalog: (status: PortfolioApiRequestStatus | undefined, size: number) =>
    [...portfolioRequestKeys.adminCatalogs(), status, size] as const,
  adminSubmissions: () => [...portfolioRequestKeys.all, 'admin-submissions'] as const,
  adminSubmissionList: (requestId: number, params: FetchAdminPortfolioSubmissionsParams) =>
    [...portfolioRequestKeys.adminSubmissions(), requestId, params] as const,
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

export function useAllAdminPortfolioRequestListQuery(
  status?: PortfolioApiRequestStatus,
  size = 20,
) {
  return useQuery({
    queryKey: portfolioRequestKeys.adminCatalog(status, size),
    queryFn: ({ signal }) => fetchAllAdminPortfolioRequestList(status, size, signal),
    staleTime: 30_000,
  });
}

export function useCreateAdminPortfolioRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateAdminPortfolioRequestRequest) =>
      createAdminPortfolioRequest(request),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: portfolioRequestKeys.adminCatalogs() }),
  });
}

export function useUpdateAdminPortfolioRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: UpdateAdminPortfolioRequestVariables) =>
      updateAdminPortfolioRequest(variables),
    onSuccess: (_response, variables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: portfolioRequestKeys.adminCatalogs() }),
        queryClient.invalidateQueries({
          queryKey: portfolioRequestKeys.detail(variables.requestId),
        }),
      ]),
  });
}

export function useUpdateAdminPortfolioRequestStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: UpdateAdminPortfolioRequestStatusVariables) =>
      updateAdminPortfolioRequestStatus(variables),
    onSuccess: (_response, variables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: portfolioRequestKeys.adminCatalogs() }),
        queryClient.invalidateQueries({
          queryKey: portfolioRequestKeys.detail(variables.requestId),
        }),
        queryClient.invalidateQueries({ queryKey: portfolioRequestKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: portfolioRequestKeys.catalogs() }),
      ]),
  });
}

export function useAdminPortfolioSubmissionsQuery(
  requestId: number | null,
  params: FetchAdminPortfolioSubmissionsParams = {},
) {
  return useQuery({
    queryKey: portfolioRequestKeys.adminSubmissionList(requestId ?? -1, params),
    queryFn:
      requestId === null ? skipToken : () => fetchAdminPortfolioSubmissions(requestId, params),
    placeholderData: keepPreviousData,
  });
}

export function useDownloadAdminPortfolioSubmissionsMutation() {
  return useMutation({
    mutationFn: (variables: DownloadAdminPortfolioSubmissionsVariables) =>
      downloadAdminPortfolioSubmissions(variables),
  });
}
