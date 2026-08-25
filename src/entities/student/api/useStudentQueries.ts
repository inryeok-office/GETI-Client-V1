'use client';

import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query';

import {
  fetchStudentList,
  fetchStudentMajorOptions,
  fetchStudentProfile,
  fetchStudentTechStackOptions,
  type FetchStudentListParams,
} from './studentApi';

export const studentKeys = {
  all: ['students'] as const,
  detail: (memberId: number) => [...studentKeys.all, 'detail', memberId] as const,
  list: (params: FetchStudentListParams | null) => [...studentKeys.all, 'list', params] as const,
  majors: () => [...studentKeys.all, 'metadata', 'majors'] as const,
  techStacks: () => [...studentKeys.all, 'metadata', 'tech-stacks'] as const,
};

/** 이름이 비어 있으면 Swagger 계약의 NAME_REQUIRED(400)를 피하기 위해 요청하지 않는다. */
export function useStudentListQuery(params: FetchStudentListParams | null) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: params === null ? skipToken : ({ signal }) => fetchStudentList(params, signal),
    placeholderData: keepPreviousData,
  });
}

/** 유효한 양의 정수 ID가 없으면 요청하지 않는다. */
export function useStudentProfileQuery(memberId: number | null) {
  return useQuery({
    queryKey: studentKeys.detail(memberId ?? -1),
    queryFn: memberId === null ? skipToken : ({ signal }) => fetchStudentProfile(memberId, signal),
  });
}

export function useStudentMajorOptionsQuery() {
  return useQuery({
    queryKey: studentKeys.majors(),
    queryFn: fetchStudentMajorOptions,
    staleTime: 30 * 60_000,
  });
}

export function useStudentTechStackOptionsQuery() {
  return useQuery({
    queryKey: studentKeys.techStacks(),
    queryFn: fetchStudentTechStackOptions,
    staleTime: 30 * 60_000,
  });
}
