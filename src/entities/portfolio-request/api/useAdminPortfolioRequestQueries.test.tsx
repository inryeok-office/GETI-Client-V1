import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  portfolioRequestKeys,
  useAllAdminPortfolioRequestListQuery,
  useCreateAdminPortfolioRequestMutation,
  useUpdateAdminPortfolioRequestStatusMutation,
} from './usePortfolioRequestQueries';

const { mockCreateRequest, mockFetchAllRequestList, mockUpdateStatus } = vi.hoisted(() => ({
  mockCreateRequest: vi.fn(),
  mockFetchAllRequestList: vi.fn(),
  mockUpdateStatus: vi.fn(),
}));

vi.mock('./portfolioRequestApi', () => ({
  createAdminPortfolioRequest: mockCreateRequest,
  fetchAllAdminPortfolioRequestList: mockFetchAllRequestList,
  updateAdminPortfolioRequestStatus: mockUpdateStatus,
}));

function setupQueryClient() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  mockCreateRequest.mockReset();
  mockFetchAllRequestList.mockReset();
  mockUpdateStatus.mockReset();
});

describe('admin portfolio request queries', () => {
  it('관리자 전체 목록 조회에 Query 취소 신호를 전달한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    mockFetchAllRequestList.mockResolvedValue([]);

    const { result } = renderHook(() => useAllAdminPortfolioRequestListQuery('DRAFT', 20), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchAllRequestList).toHaveBeenCalledWith('DRAFT', 20, expect.any(AbortSignal));
    queryClient.clear();
  });

  it('등록 성공 시 포트폴리오 Query를 갱신한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    mockCreateRequest.mockResolvedValue({ requestId: 1 });

    const { result } = renderHook(useCreateAdminPortfolioRequestMutation, { wrapper });
    result.current.mutate({
      dueAt: '2026-08-31T23:59:59',
      targetStudentIds: [11],
      title: '상반기 포트폴리오',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: portfolioRequestKeys.adminCatalogs(),
    });
    queryClient.clear();
  });

  it('상태 변경 성공 시 포트폴리오 Query를 갱신한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    mockUpdateStatus.mockResolvedValue({ requestId: 1, status: 'DELETED' });

    const { result } = renderHook(useUpdateAdminPortfolioRequestStatusMutation, { wrapper });
    result.current.mutate({ requestId: 1, status: 'DELETED' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: portfolioRequestKeys.adminCatalogs(),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: portfolioRequestKeys.detail(1),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: portfolioRequestKeys.lists() });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: portfolioRequestKeys.catalogs() });
    queryClient.clear();
  });
});
