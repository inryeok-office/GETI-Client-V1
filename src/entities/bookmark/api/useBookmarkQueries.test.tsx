import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  bookmarkKeys,
  useBookmarkListQuery,
  useCreateBookmarkMutation,
  useDeleteBookmarkMutation,
} from './useBookmarkQueries';

const { mockCreateBookmark, mockDeleteBookmark, mockFetchBookmarkList } = vi.hoisted(() => ({
  mockCreateBookmark: vi.fn(),
  mockDeleteBookmark: vi.fn(),
  mockFetchBookmarkList: vi.fn(),
}));

vi.mock('./bookmarkApi', () => ({
  createBookmark: mockCreateBookmark,
  deleteBookmark: mockDeleteBookmark,
  fetchBookmarkList: mockFetchBookmarkList,
}));

function setupQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  mockCreateBookmark.mockReset();
  mockDeleteBookmark.mockReset();
  mockFetchBookmarkList.mockReset();
});

describe('bookmark queries', () => {
  it('북마크 목록 조회 조건을 API 함수에 전달한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    mockFetchBookmarkList.mockResolvedValue({ content: [] });

    const { result } = renderHook(
      () => useBookmarkListQuery({ page: 1, size: 10, sort: 'DEADLINE' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchBookmarkList).toHaveBeenCalledWith({ page: 1, size: 10, sort: 'DEADLINE' });
    queryClient.clear();
  });

  it('북마크 등록 성공 시 북마크 Query를 갱신한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    mockCreateBookmark.mockResolvedValue({
      jobId: 12,
      title: '백엔드 개발자 채용',
      postingType: 'MOU',
      applicationMethod: 'INTERNAL',
      status: 'PUBLISHED',
      company: null,
      endDate: null,
      viewCount: 10,
      bookmarked: true,
      techStacks: [],
      bookmarkCount: 3,
      location: null,
      employmentType: null,
    });

    const { result } = renderHook(useCreateBookmarkMutation, { wrapper });
    result.current.mutate({ jobId: 12 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: bookmarkKeys.all });
    queryClient.clear();
  });

  it('북마크 해제 성공 시 북마크 Query를 갱신한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    mockDeleteBookmark.mockResolvedValue(undefined);

    const { result } = renderHook(useDeleteBookmarkMutation, { wrapper });
    result.current.mutate(12);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: bookmarkKeys.all });
    queryClient.clear();
  });

  it('북마크 해제 요청 중에는 목록 캐시에서 대상 공고를 먼저 제거한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    const params = { page: 0, size: 20 };
    queryClient.setQueryData(bookmarkKeys.list(params), {
      content: [
        { jobId: 1, title: '삭제 대상' },
        { jobId: 2, title: '유지 대상' },
      ],
      totalElements: 2,
    });
    mockDeleteBookmark.mockResolvedValue(undefined);

    const { result } = renderHook(useDeleteBookmarkMutation, { wrapper });

    await act(async () => {
      await result.current.mutateAsync(1);
    });

    expect(queryClient.getQueryData(bookmarkKeys.list(params))).toMatchObject({
      content: [{ jobId: 2, title: '유지 대상' }],
      totalElements: 1,
    });
    queryClient.clear();
  });

  it('북마크 해제 실패 시 이전 목록 캐시를 복구한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    const params = { page: 0, size: 20 };
    const previousList = {
      content: [
        { jobId: 1, title: '삭제 대상' },
        { jobId: 2, title: '유지 대상' },
      ],
      totalElements: 2,
    };
    queryClient.setQueryData(bookmarkKeys.list(params), previousList);
    mockDeleteBookmark.mockRejectedValue(new Error('network'));

    const { result } = renderHook(useDeleteBookmarkMutation, { wrapper });

    await expect(result.current.mutateAsync(1)).rejects.toThrow('network');

    expect(queryClient.getQueryData(bookmarkKeys.list(params))).toEqual(previousList);
    queryClient.clear();
  });
});
