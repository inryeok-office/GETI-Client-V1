'use client';

import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  CreateAdminInquiryAnswerVariables,
  CreateInquiryRequest,
  FetchAdminInquiryListParams,
  FetchMyInquiryListParams,
  UpdateAdminInquiryStatusVariables,
} from '../model/types';
import {
  createAdminInquiryAnswer,
  createInquiry,
  downloadInquiryFile,
  fetchAdminInquiryList,
  fetchInquiryDetail,
  fetchMyInquiryList,
  updateAdminInquiryStatus,
} from './inquiryApi';

export const inquiryKeys = {
  all: ['inquiries'] as const,
  lists: () => [...inquiryKeys.all, 'list'] as const,
  list: (params: FetchMyInquiryListParams) => [...inquiryKeys.lists(), params] as const,
  adminLists: () => [...inquiryKeys.all, 'admin-list'] as const,
  adminList: (params: FetchAdminInquiryListParams) =>
    [...inquiryKeys.adminLists(), params] as const,
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

export function useAdminInquiryListQuery(params: FetchAdminInquiryListParams = {}) {
  return useQuery({
    queryKey: inquiryKeys.adminList(params),
    queryFn: () => fetchAdminInquiryList(params),
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

/** 상태 변경 뒤 목록과 열린 상세가 같은 서버 상태를 다시 조회하도록 문의 Query를 갱신한다. */
export function useUpdateAdminInquiryStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateAdminInquiryStatusVariables) =>
      updateAdminInquiryStatus(variables),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inquiryKeys.all }),
  });
}

/** 답변 등록은 상태도 ANSWERED로 바꾸므로 목록과 상세 Query를 함께 갱신한다. */
export function useCreateAdminInquiryAnswerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CreateAdminInquiryAnswerVariables) =>
      createAdminInquiryAnswer(variables),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inquiryKeys.all }),
  });
}

export function useDownloadInquiryFileMutation() {
  return useMutation({
    mutationFn: ({ fileId }: { fileId: number }) => downloadInquiryFile(fileId),
  });
}
