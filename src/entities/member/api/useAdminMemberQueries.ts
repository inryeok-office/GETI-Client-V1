'use client';

import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query';

import {
  fetchAdminMemberDetail,
  fetchAdminMemberList,
  type FetchAdminMemberListParams,
} from './adminMemberApi';
import { memberKeys } from './useMyProfileQuery';

export const adminMemberKeys = {
  all: [...memberKeys.all, 'admin'] as const,
  list: (params: FetchAdminMemberListParams) => [...adminMemberKeys.all, 'list', params] as const,
  detail: (memberId: number) => [...adminMemberKeys.all, 'detail', memberId] as const,
};

/**
 * 관리자 회원 목록. 페이지·필터를 바꿀 때 이전 결과를 유지한 채 다음 결과를 가져온다
 * (`keepPreviousData`, `useJobListQuery`와 동일).
 */
export function useAdminMemberListQuery(params: FetchAdminMemberListParams = {}) {
  return useQuery({
    queryKey: adminMemberKeys.list(params),
    queryFn: () => fetchAdminMemberList(params),
    placeholderData: keepPreviousData,
  });
}

/** memberId가 null이면(아무도 선택하지 않았으면) 요청을 보내지 않는다(`useAdminJobDetailQuery`와 동일). */
export function useAdminMemberDetailQuery(memberId: number | null) {
  return useQuery({
    queryKey: adminMemberKeys.detail(memberId ?? -1),
    queryFn: memberId === null ? skipToken : () => fetchAdminMemberDetail(memberId),
  });
}
