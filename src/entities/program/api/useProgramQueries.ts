'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { fetchAdminProgramList, type FetchAdminProgramListParams } from './adminProgramApi';

export const programKeys = {
  all: ['programs'] as const,
  adminLists: () => [...programKeys.all, 'admin-list'] as const,
  adminList: (params: FetchAdminProgramListParams) =>
    [...programKeys.adminLists(), params] as const,
};

/** 관리자 프로그램 목록. 대시보드 "프로그램" KPI는 `size=1`로 `totalElements`만 읽는다. */
export function useAdminProgramListQuery(params: FetchAdminProgramListParams = {}) {
  return useQuery({
    queryKey: programKeys.adminList(params),
    queryFn: () => fetchAdminProgramList(params),
    placeholderData: keepPreviousData,
  });
}
