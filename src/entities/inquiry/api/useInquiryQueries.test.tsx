import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  inquiryKeys,
  useCreateAdminInquiryAnswerMutation,
  useCreateInquiryMutation,
  useUpdateAdminInquiryStatusMutation,
} from './useInquiryQueries';

const { mockCreateAdminInquiryAnswer, mockCreateInquiry, mockUpdateAdminInquiryStatus } =
  vi.hoisted(() => ({
    mockCreateAdminInquiryAnswer: vi.fn(),
    mockCreateInquiry: vi.fn(),
    mockUpdateAdminInquiryStatus: vi.fn(),
  }));

vi.mock('./inquiryApi', () => ({
  createAdminInquiryAnswer: mockCreateAdminInquiryAnswer,
  createInquiry: mockCreateInquiry,
  fetchAdminInquiryList: vi.fn(),
  fetchInquiryDetail: vi.fn(),
  fetchMyInquiryList: vi.fn(),
  downloadInquiryFile: vi.fn(),
  updateAdminInquiryStatus: mockUpdateAdminInquiryStatus,
}));

beforeEach(() => {
  mockCreateInquiry.mockReset();
  mockCreateInquiry.mockResolvedValue({ inquiryId: 1 });
  mockCreateAdminInquiryAnswer.mockReset();
  mockCreateAdminInquiryAnswer.mockResolvedValue({ answerId: 1 });
  mockUpdateAdminInquiryStatus.mockReset();
  mockUpdateAdminInquiryStatus.mockResolvedValue({ inquiryId: 1, status: 'IN_PROGRESS' });
});

describe('admin inquiry mutations', () => {
  function setupQueryClient() {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { queryClient, wrapper };
  }

  it('상태 변경 성공 후 문의 Query 전체를 무효화한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateAdminInquiryStatusMutation(), { wrapper });
    const variables = { inquiryId: 1, status: 'IN_PROGRESS' as const };

    await act(async () => result.current.mutateAsync(variables));

    expect(mockUpdateAdminInquiryStatus).toHaveBeenCalledWith(variables);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: inquiryKeys.all });
    queryClient.clear();
  });

  it('답변 등록 성공 후 문의 Query 전체를 무효화한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateAdminInquiryAnswerMutation(), { wrapper });
    const variables = { inquiryId: 1, content: '답변입니다.' };

    await act(async () => result.current.mutateAsync(variables));

    expect(mockCreateAdminInquiryAnswer).toHaveBeenCalledWith(variables);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: inquiryKeys.all });
    queryClient.clear();
  });
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
