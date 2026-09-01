import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  portfolioRequestKeys,
  usePortfolioRequestDetailQuery,
  usePortfolioRequestListQuery,
  useUpsertPortfolioSubmissionMutation,
} from './usePortfolioRequestQueries';

const {
  mockFetchPortfolioRequestDetail,
  mockFetchPortfolioRequestList,
  mockUpsertPortfolioSubmission,
} = vi.hoisted(() => ({
  mockFetchPortfolioRequestDetail: vi.fn(),
  mockFetchPortfolioRequestList: vi.fn(),
  mockUpsertPortfolioSubmission: vi.fn(),
}));

vi.mock('./portfolioRequestApi', () => ({
  fetchPortfolioRequestDetail: mockFetchPortfolioRequestDetail,
  fetchPortfolioRequestList: mockFetchPortfolioRequestList,
  upsertPortfolioSubmission: mockUpsertPortfolioSubmission,
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
  mockFetchPortfolioRequestDetail.mockReset();
  mockFetchPortfolioRequestList.mockReset();
  mockUpsertPortfolioSubmission.mockReset();
});

describe('portfolio request queries', () => {
  it('목록 조회 조건을 API 함수에 전달한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    mockFetchPortfolioRequestList.mockResolvedValue({ content: [] });

    const { result } = renderHook(
      () => usePortfolioRequestListQuery({ page: 1, size: 10, status: 'PUBLISHED' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchPortfolioRequestList).toHaveBeenCalledWith({
      page: 1,
      size: 10,
      status: 'PUBLISHED',
    });
    queryClient.clear();
  });

  it('상세 조회 requestId를 API 함수에 전달한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    mockFetchPortfolioRequestDetail.mockResolvedValue({ requestId: 1 });

    const { result } = renderHook(() => usePortfolioRequestDetailQuery(1), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchPortfolioRequestDetail).toHaveBeenCalledWith(1);
    queryClient.clear();
  });

  it('유효한 requestId가 없으면 상세 API를 호출하지 않는다', () => {
    const { queryClient, wrapper } = setupQueryClient();

    const { result } = renderHook(() => usePortfolioRequestDetailQuery(null), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetchPortfolioRequestDetail).not.toHaveBeenCalled();
    queryClient.clear();
  });

  it('임시저장/제출 성공 후 상세와 목록 query를 갱신한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    mockUpsertPortfolioSubmission.mockResolvedValue({
      requestId: 1,
      status: 'SUBMITTED',
      submissionId: 3,
    });

    const { result } = renderHook(() => useUpsertPortfolioSubmissionMutation(1), { wrapper });
    result.current.mutate({ fileIds: [7], portfolioUrl: null, status: 'SUBMITTED' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: portfolioRequestKeys.detail(1) });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: portfolioRequestKeys.lists() });
    queryClient.clear();
  });
});
