import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useAdminCollectorRunDetailQuery,
  useAdminCollectorRunListQuery,
  useAdminJobSourceListQuery,
  useExecuteAdminCollectorActionMutation,
  useTrackAdminCollectorRuns,
  useUpdateAdminJobSourceMutation,
} from './useCollectorQueries';

const { mockExecuteAction, mockFetchDetail, mockFetchList, mockFetchSources, mockUpdateSource } =
  vi.hoisted(() => ({
    mockExecuteAction: vi.fn(),
    mockFetchDetail: vi.fn(),
    mockFetchList: vi.fn(),
    mockFetchSources: vi.fn(),
    mockUpdateSource: vi.fn(),
  }));

vi.mock('./collectorApi', () => ({
  executeAdminCollectorAction: mockExecuteAction,
  fetchAdminCollectorRunDetail: mockFetchDetail,
  fetchAdminCollectorRunList: mockFetchList,
  fetchAdminJobSources: mockFetchSources,
  updateAdminJobSource: mockUpdateSource,
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
  mockExecuteAction.mockReset();
  mockFetchDetail.mockReset();
  mockFetchList.mockReset();
  mockFetchSources.mockReset();
  mockUpdateSource.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('collector queries', () => {
  it('목록 조회 조건을 API 함수에 전달한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    mockFetchList.mockResolvedValue({ content: [] });

    const { result } = renderHook(
      () => useAdminCollectorRunListQuery({ page: 0, size: 5, status: 'FAILED' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchList).toHaveBeenCalledWith({ page: 0, size: 5, status: 'FAILED' });
    queryClient.clear();
  });

  it('목록에 진행 중 실행이 있으면 완료 상태를 확인할 때까지 다시 조회한다', async () => {
    vi.useFakeTimers();
    const { queryClient, wrapper } = setupQueryClient();
    mockFetchList
      .mockResolvedValueOnce({ content: [{ status: 'RUNNING' }] })
      .mockResolvedValueOnce({ content: [{ status: 'SUCCESS' }] });

    const { unmount } = renderHook(() => useAdminCollectorRunListQuery(), { wrapper });

    await vi.waitFor(() => expect(mockFetchList).toHaveBeenCalledOnce());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    expect(mockFetchList).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    expect(mockFetchList).toHaveBeenCalledTimes(2);
    unmount();
    queryClient.clear();
  });

  it('수집원 목록을 조회한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    mockFetchSources.mockResolvedValue({ sources: [] });

    const { result } = renderHook(useAdminJobSourceListQuery, { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchSources).toHaveBeenCalledOnce();
    queryClient.clear();
  });

  it('선택한 실행이 없으면 상세를 요청하지 않는다', () => {
    const { queryClient, wrapper } = setupQueryClient();

    const { result } = renderHook(() => useAdminCollectorRunDetailQuery(null), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetchDetail).not.toHaveBeenCalled();
    queryClient.clear();
  });

  it('열린 상세가 진행 중이면 완료 상태를 확인할 때까지 다시 조회한다', async () => {
    vi.useFakeTimers();
    const { queryClient, wrapper } = setupQueryClient();
    mockFetchDetail
      .mockResolvedValueOnce({ runId: 10, status: 'PENDING' })
      .mockResolvedValueOnce({ runId: 10, status: 'SUCCESS' });

    const { unmount } = renderHook(() => useAdminCollectorRunDetailQuery(10), { wrapper });

    await vi.waitFor(() => expect(mockFetchDetail).toHaveBeenCalledOnce());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    expect(mockFetchDetail).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    expect(mockFetchDetail).toHaveBeenCalledTimes(2);
    unmount();
    queryClient.clear();
  });

  it('수동 실행 ID를 최종 상태까지 추적하고 목록과 수집원 정보를 갱신한다', async () => {
    vi.useFakeTimers();
    const { queryClient, wrapper } = setupQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    mockFetchDetail
      .mockResolvedValueOnce({ runId: 10, status: 'PENDING' })
      .mockResolvedValueOnce({ runId: 10, status: 'SUCCESS' });

    const { unmount } = renderHook(() => useTrackAdminCollectorRuns([10]), { wrapper });

    await act(async () => {
      await vi.waitFor(() => expect(mockFetchDetail).toHaveBeenCalledOnce());
      await vi.waitFor(() => {
        expect(invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['collector', 'runs', 'list'],
        });
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['collector', 'sources'] });
      });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    expect(mockFetchDetail).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    expect(mockFetchDetail).toHaveBeenCalledTimes(2);
    unmount();
    queryClient.clear();
  });

  it('수집원 변경 완료 후 수집 Query를 갱신한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    mockUpdateSource.mockResolvedValue({ sourceId: 2, enabled: false });

    const { result } = renderHook(useUpdateAdminJobSourceMutation, { wrapper });
    result.current.mutate({ sourceId: 2, enabled: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['collector'] });
    queryClient.clear();
  });

  it('수동 실행 접수 성공 후 수집 Query를 갱신한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    mockExecuteAction.mockResolvedValue({ runIds: [10], status: 'PENDING' });

    const { result } = renderHook(useExecuteAdminCollectorActionMutation, { wrapper });
    result.current.mutate({ action: 'COLLECT', sourceIds: [2] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['collector'] });
    queryClient.clear();
  });
});
