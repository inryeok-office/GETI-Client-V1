'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';

import type {
  BookmarkListApiResponse,
  CreateBookmarkRequest,
  FetchBookmarkListParams,
} from '../model/types';
import { createBookmark, deleteBookmark, fetchBookmarkList } from './bookmarkApi';

export const bookmarkKeys = {
  all: ['bookmarks'] as const,
  lists: () => [...bookmarkKeys.all, 'list'] as const,
  list: (params: FetchBookmarkListParams) => [...bookmarkKeys.lists(), params] as const,
};

export function useBookmarkListQuery(params: FetchBookmarkListParams = {}) {
  return useQuery({
    queryKey: bookmarkKeys.list(params),
    queryFn: () => fetchBookmarkList(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBookmarkRequest) => createBookmark(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookmarkKeys.all }),
  });
}

export function useDeleteBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: number) => deleteBookmark(jobId),
    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.lists() });

      const previousLists = queryClient.getQueriesData<BookmarkListApiResponse>({
        queryKey: bookmarkKeys.lists(),
      });

      queryClient.setQueriesData<BookmarkListApiResponse>(
        { queryKey: bookmarkKeys.lists() },
        (current) => {
          if (!current) return current;

          const nextContent = current.content.filter((job) => job.jobId !== jobId);
          if (nextContent.length === current.content.length) return current;

          return {
            ...current,
            content: nextContent,
            totalElements: Math.max(0, current.totalElements - 1),
          };
        },
      );

      return { previousLists };
    },
    onError: (_error, _jobId, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData(queryKey as QueryKey, data);
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: bookmarkKeys.all }),
  });
}
