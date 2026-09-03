import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { jobKeys, useReanalyzeAdminJobMutation } from './useJobQueries';

const { mockReanalyzeAdminJob } = vi.hoisted(() => ({ mockReanalyzeAdminJob: vi.fn() }));

vi.mock('./jobApi', () => ({
  reanalyzeAdminJob: mockReanalyzeAdminJob,
  changeAdminJobStatus: vi.fn(),
  createAdminJob: vi.fn(),
  downloadJobAttachment: vi.fn(),
  fetchAdminJobDetail: vi.fn(),
  fetchJobDetail: vi.fn(),
  fetchJobList: vi.fn(),
  fetchJobSources: vi.fn(),
  updateAdminJob: vi.fn(),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  mockReanalyzeAdminJob.mockReset();
});

describe('useReanalyzeAdminJobMutation', () => {
  it('성공하면 job Query를 무효화한다', async () => {
    mockReanalyzeAdminJob.mockResolvedValue(undefined);
    const { queryClient, wrapper } = makeWrapper();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useReanalyzeAdminJobMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(7);
    });

    expect(mockReanalyzeAdminJob).toHaveBeenCalledWith(7);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: jobKeys.all });
    queryClient.clear();
  });

  it('상세 재조회가 끝날 때까지 isPending을 유지한다(중복 요청 방지)', async () => {
    mockReanalyzeAdminJob.mockResolvedValue(undefined);
    const { queryClient, wrapper } = makeWrapper();

    // invalidateQueries가 오래 걸리는 상황을 흉내 낸다 — onSuccess가 이 Promise를 반환하면
    // 그동안 mutation은 계속 pending이어야 한다.
    let resolveInvalidate: () => void = () => {};
    vi.spyOn(queryClient, 'invalidateQueries').mockImplementation(
      () => new Promise<void>((resolve) => (resolveInvalidate = resolve)),
    );
    const { result } = renderHook(() => useReanalyzeAdminJobMutation(), { wrapper });

    act(() => {
      result.current.mutate(7);
    });

    // mutationFn은 이미 resolve됐지만 invalidate가 안 끝나 아직 pending이어야 한다.
    await waitFor(() => expect(mockReanalyzeAdminJob).toHaveBeenCalled());
    expect(result.current.isPending).toBe(true);

    await act(async () => {
      resolveInvalidate();
    });
    await waitFor(() => expect(result.current.isPending).toBe(false));
    queryClient.clear();
  });
});
