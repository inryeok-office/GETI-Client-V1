'use client';

import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCompany,
  fetchAllCompanyOptions,
  fetchCompanyDetail,
  fetchCompanyList,
  updateCompany,
  type CompanyMutationPayload,
  type FetchCompanyListParams,
  type UpdateCompanyParams,
} from './companyApi';

export const companyKeys = {
  all: ['companies'] as const,
  list: (params: FetchCompanyListParams) => [...companyKeys.all, 'list', params] as const,
  detail: (companyId: number) => [...companyKeys.all, 'detail', companyId] as const,
  options: () => [...companyKeys.all, 'options'] as const,
};

export function useCompanyListQuery(params: FetchCompanyListParams = {}) {
  return useQuery({
    queryKey: companyKeys.list(params),
    queryFn: () => fetchCompanyList(params),
  });
}

/** companyId가 null이면 요청을 보내지 않는다(수정 패널이 닫혀 있을 때). */
export function useCompanyDetailQuery(companyId: number | null) {
  return useQuery({
    queryKey: companyKeys.detail(companyId ?? -1),
    queryFn: companyId === null ? skipToken : () => fetchCompanyDetail(companyId),
  });
}

/** 등록 성공 시 목록을 다시 불러온다. */
export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CompanyMutationPayload) => createCompany(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

/** 수정 성공 시 목록을 다시 불러온다. */
export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateCompanyParams) => updateCompany(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

/** 지원자 관리 화면의 "기업" 드롭다운. 상한 없이 전체 기업을 모은다. */
export function useCompanyOptionsQuery() {
  return useQuery({
    queryKey: companyKeys.options(),
    queryFn: fetchAllCompanyOptions,
  });
}
