'use client';

import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  fetchAdminMemberDetail,
  fetchAdminMemberList,
  updateAdminMemberRoles,
  updateAdminMemberStatus,
  type FetchAdminMemberListParams,
} from './adminMemberApi';
import { memberKeys } from './useMyProfileQuery';
import type { AdminMemberDetail, AdminMemberRole, AdminMemberStatus } from '../model/adminMember';

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

/**
 * 응답으로 온 최신 상세를 상세 캐시에 즉시 반영하고, 목록 캐시는 무효화한다. `onSuccess`가
 * `invalidateQueries`의 Promise를 반환해 재조회가 끝날 때까지 `isPending`을 유지한다
 * (버튼이 다시 열려 같은 변경을 재호출하는 걸 막는다, PR #208 코드리뷰와 같은 이유).
 */
function useAdminMemberWriteResult() {
  const queryClient = useQueryClient();

  return (updated: AdminMemberDetail) => {
    queryClient.setQueryData(adminMemberKeys.detail(updated.memberId), updated);
    return queryClient.invalidateQueries({ queryKey: [...adminMemberKeys.all, 'list'] });
  };
}

/** 회원 Role Set 전체 교체(`PATCH /admin/members/{id}/roles`). */
export function useUpdateAdminMemberRolesMutation() {
  const onWritten = useAdminMemberWriteResult();

  return useMutation({
    mutationFn: ({ memberId, roles }: { memberId: number; roles: AdminMemberRole[] }) =>
      updateAdminMemberRoles(memberId, roles),
    onSuccess: onWritten,
  });
}

/** 회원 계정 상태 변경(`PATCH /admin/members/{id}/status`, ACTIVE ↔ SUSPENDED). */
export function useUpdateAdminMemberStatusMutation() {
  const onWritten = useAdminMemberWriteResult();

  return useMutation({
    mutationFn: ({ memberId, status }: { memberId: number; status: AdminMemberStatus }) =>
      updateAdminMemberStatus(memberId, status),
    onSuccess: onWritten,
  });
}
