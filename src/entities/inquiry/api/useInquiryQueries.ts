'use client';

import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { CreateInquiryRequest, FetchMyInquiryListParams } from '../model/types';
import { createInquiry, fetchInquiryDetail, fetchMyInquiryList } from './inquiryApi';

export const inquiryKeys = {
  all: ['inquiries'] as const,
  lists: () => [...inquiryKeys.all, 'list'] as const,
  list: (params: FetchMyInquiryListParams) => [...inquiryKeys.lists(), params] as const,
  details: () => [...inquiryKeys.all, 'detail'] as const,
  detail: (inquiryId: number) => [...inquiryKeys.details(), inquiryId] as const,
};

export function useMyInquiryListQuery(params: FetchMyInquiryListParams = {}) {
  return useQuery({
    queryKey: inquiryKeys.list(params),
    queryFn: () => fetchMyInquiryList(params),
    placeholderData: keepPreviousData,
  });
}

/** inquiryId는 호출부에서 유효한 양의 정수로 확인한 값만 받는다. */
export function useInquiryDetailQuery(inquiryId: number | null) {
  return useQuery({
    queryKey: inquiryKeys.detail(inquiryId ?? -1),
    queryFn: inquiryId === null ? skipToken : () => fetchInquiryDetail(inquiryId),
  });
}

/** 등록 성공 후 현재 조건과 무관하게 내 문의 목록 Query를 모두 갱신한다. */
export function useCreateInquiryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateInquiryRequest) => createInquiry(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inquiryKeys.lists() }),
  });
}
