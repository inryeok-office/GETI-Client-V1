'use client';

import { keepPreviousData, skipToken, useMutation, useQuery } from '@tanstack/react-query';

import {
  downloadJobAttachment,
  fetchJobDetail,
  fetchJobList,
  fetchJobSources,
  type FetchJobListParams,
} from './jobApi';

export const jobKeys = {
  all: ['jobs'] as const,
  list: (params: FetchJobListParams) => [...jobKeys.all, 'list', params] as const,
  detail: (jobId: number) => [...jobKeys.all, 'detail', jobId] as const,
  sources: () => [...jobKeys.all, 'sources'] as const,
};

/**
 * `keepPreviousData`로 페이지를 넘길 때 이전 페이지 데이터를 유지한 채 다음 페이지를 가져온다 —
 * 호출부가 `isLoading`(최초 로딩)과 `isFetching`(페이지 전환 로딩)을 구분해 두 스켈레톤 상태를 나눌 수 있다.
 */
export function useJobListQuery(
  params: FetchJobListParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: jobKeys.list(params),
    queryFn: () => fetchJobList(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled,
  });
}

/** jobId는 호출부에서 `Number.isInteger`로 걸러진 값만 넘긴다(NaN 요청 방지). */
export function useJobDetailQuery(jobId: number | null) {
  return useQuery({
    queryKey: jobKeys.detail(jobId ?? -1),
    queryFn: jobId === null ? skipToken : () => fetchJobDetail(jobId),
  });
}

/** 공고 목록 "출처" 필터 드롭다운. 자주 바뀌지 않는 목록이라 상한 없이 전체를 모은다. */
export function useJobSourcesQuery() {
  return useQuery({
    queryKey: jobKeys.sources(),
    queryFn: fetchJobSources,
  });
}

/** 공고 첨부파일 다운로드. 서버 상태를 바꾸지 않으니 쿼리 무효화는 하지 않는다. */
export function useDownloadJobAttachmentMutation() {
  return useMutation({
    mutationFn: (downloadUrl: string) => downloadJobAttachment(downloadUrl),
  });
}
