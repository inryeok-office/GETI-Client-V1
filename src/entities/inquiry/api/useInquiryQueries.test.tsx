import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { inquiryKeys, useCreateInquiryMutation } from './useInquiryQueries';

const { mockCreateInquiry } = vi.hoisted(() => ({
  mockCreateInquiry: vi.fn(),
}));

vi.mock('./inquiryApi', () => ({
  createInquiry: mockCreateInquiry,
  fetchInquiryDetail: vi.fn(),
  fetchMyInquiryList: vi.fn(),
}));

beforeEach(() => {
  mockCreateInquiry.mockReset();
  mockCreateInquiry.mockResolvedValue({ inquiryId: 1 });
});

describe('useCreateInquiryMutation', () => {
  it('등록 성공 후 모든 내 문의 목록 Query를 무효화한다', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCreateInquiryMutation(), { wrapper });
    const request = {
      inquiryType: 'FEATURE_REQUEST' as const,
      title: '기능 요청',
      content: '새 기능을 요청합니다.',
    };

    await act(async () => {
      await result.current.mutateAsync(request);
    });

    expect(mockCreateInquiry).toHaveBeenCalledWith(request);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: inquiryKeys.lists() });
    queryClient.clear();
  });
});
