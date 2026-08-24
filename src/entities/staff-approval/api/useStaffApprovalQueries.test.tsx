import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { staffApprovalKeys, useStaffApprovalActionMutation } from './useStaffApprovalQueries';

const { mockExecuteStaffApprovalAction } = vi.hoisted(() => ({
  mockExecuteStaffApprovalAction: vi.fn(),
}));

vi.mock('./staffApprovalApi', () => ({
  executeStaffApprovalAction: mockExecuteStaffApprovalAction,
  fetchStaffApprovalRequests: vi.fn(),
}));

beforeEach(() => {
  mockExecuteStaffApprovalAction.mockReset();
});

describe('useStaffApprovalActionMutation', () => {
  it('성공하면 목록 Query를 무효화한다', async () => {
    mockExecuteStaffApprovalAction.mockResolvedValue(undefined);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useStaffApprovalActionMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ memberId: 1, action: 'APPROVE' });
    });

    expect(mockExecuteStaffApprovalAction).toHaveBeenCalledWith({ memberId: 1, action: 'APPROVE' });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: staffApprovalKeys.all });
    queryClient.clear();
  });

  it('409 충돌로 실패해도 목록 Query를 무효화한다(최신 상태를 다시 보여주기 위해)', async () => {
    mockExecuteStaffApprovalAction.mockRejectedValue(new Error('conflict'));
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useStaffApprovalActionMutation(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ memberId: 1, action: 'REJECT', reason: '사유' })
        .catch(() => {});
    });

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: staffApprovalKeys.all });
    queryClient.clear();
  });
});
