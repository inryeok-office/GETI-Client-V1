import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CollectorRunApiDetail, CollectorRunListApiResponse } from '@/entities/collector';

import { AdminCollectorManagementPage } from './AdminCollectorManagementPage';

const {
  mockDetailRefetch,
  mockExecuteAction,
  mockListRefetch,
  mockReplace,
  mockSourceRefetch,
  mockUpdateSource,
  mockUseDetailQuery,
  mockUseExecuteMutation,
  mockUseListQuery,
  mockUseSourceQuery,
  mockUseTrackRuns,
  mockUseUpdateMutation,
} = vi.hoisted(() => ({
  mockDetailRefetch: vi.fn(),
  mockExecuteAction: vi.fn(),
  mockListRefetch: vi.fn(),
  mockReplace: vi.fn(),
  mockSourceRefetch: vi.fn(),
  mockUpdateSource: vi.fn(),
  mockUseDetailQuery: vi.fn(),
  mockUseExecuteMutation: vi.fn(),
  mockUseListQuery: vi.fn(),
  mockUseSourceQuery: vi.fn(),
  mockUseTrackRuns: vi.fn(),
  mockUseUpdateMutation: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/collector',
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock('@/entities/collector', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/collector')>();
  return {
    ...actual,
    useAdminCollectorRunDetailQuery: mockUseDetailQuery,
    useAdminCollectorRunListQuery: mockUseListQuery,
    useAdminJobSourceListQuery: mockUseSourceQuery,
    useExecuteAdminCollectorActionMutation: mockUseExecuteMutation,
    useTrackAdminCollectorRuns: mockUseTrackRuns,
    useUpdateAdminJobSourceMutation: mockUseUpdateMutation,
  };
});

const SUMMARY = {
  action: 'COLLECT',
  createdCount: 4,
  failedCount: 1,
  failureCount: 1,
  finishedAt: '2026-08-01T09:03:00',
  partialQualityCount: 0,
  runId: 7,
  sourceId: 2,
  sourceName: 'JOB-ALIO',
  startedAt: '2026-08-01T09:00:00',
  status: 'FAILED',
  successCount: 4,
  updatedCount: 2,
} as const;

const LIST_RESPONSE: CollectorRunListApiResponse = {
  content: [SUMMARY],
  first: true,
  last: true,
  page: 0,
  size: 5,
  totalElements: 1,
  totalPages: 1,
};

const DETAIL_RESPONSE: CollectorRunApiDetail = {
  ...SUMMARY,
  errors: [
    {
      code: 'SOURCE_TIMEOUT',
      externalJobId: null,
      message: '수집원 응답 시간이 초과되었습니다.',
      missingFields: [],
      occurredAt: '2026-08-01T09:01:00',
    },
  ],
  totalCount: 5,
};

beforeEach(() => {
  mockReplace.mockReset();
  mockListRefetch.mockReset();
  mockDetailRefetch.mockReset();
  mockExecuteAction.mockReset();
  mockSourceRefetch.mockReset();
  mockUpdateSource.mockReset();
  mockUseTrackRuns.mockReset();
  mockUseListQuery.mockReturnValue({
    data: LIST_RESPONSE,
    isError: false,
    isLoading: false,
    isPlaceholderData: false,
    refetch: mockListRefetch,
  });
  mockUseSourceQuery.mockReturnValue({
    data: {
      sources: [
        {
          approvalStatus: 'READY',
          configured: true,
          dailyRequestLimit: 100,
          enabled: true,
          lastCollectedAt: null,
          lastError: null,
          lastFailureAt: null,
          lastSuccessAt: '2026-08-01T09:03:00',
          name: 'JOB-ALIO',
          sourceCode: 'JOB_ALIO',
          sourceId: 2,
          sourceType: 'EXTERNAL_API',
        },
      ],
    },
    isError: false,
    isLoading: false,
    refetch: mockSourceRefetch,
  });
  mockUseDetailQuery.mockImplementation((runId: number | null) => ({
    data: runId === 7 ? DETAIL_RESPONSE : undefined,
    isError: false,
    isLoading: false,
    refetch: mockDetailRefetch,
  }));
  mockUseUpdateMutation.mockReturnValue({
    isPending: false,
    mutate: mockUpdateSource,
    variables: undefined,
  });
  mockUseExecuteMutation.mockReturnValue({
    isPending: false,
    mutate: mockExecuteAction,
  });
});

describe('AdminCollectorManagementPage', () => {
  it('목록과 URL로 선택된 실행 상세를 실제 Query 결과로 조합한다', async () => {
    render(<AdminCollectorManagementPage initialSearchParams={{ runId: '7' }} />);

    expect(mockUseListQuery).toHaveBeenCalledWith(
      {
        endAt: undefined,
        page: 0,
        size: 5,
        sourceId: undefined,
        startAt: undefined,
        status: undefined,
      },
      { isEnabled: true },
    );
    expect(mockUseDetailQuery).toHaveBeenCalledWith(7);
    expect(screen.getAllByText('JOB-ALIO').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('SOURCE_TIMEOUT')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '상세 패널 닫기' }));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenLastCalledWith('/admin/collector', { scroll: false });
    });
  });

  it('유효하지 않은 실행 ID는 상세 Query를 비활성 상태로 유지한다', () => {
    render(<AdminCollectorManagementPage initialSearchParams={{ runId: 'invalid' }} />);

    expect(mockUseDetailQuery).toHaveBeenCalledWith(null);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('수집원 활성 상태 변경과 선택 수집원 실행을 mutation에 전달한다', () => {
    render(<AdminCollectorManagementPage />);

    fireEvent.click(screen.getByRole('switch', { name: 'JOB-ALIO 활성 상태' }));
    expect(mockUpdateSource).toHaveBeenCalledWith(
      { enabled: false, sourceId: 2 },
      expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'JOB-ALIO 실행 대상 선택' }));
    fireEvent.click(screen.getByRole('button', { name: '선택 수집원 실행' }));
    expect(mockExecuteAction).toHaveBeenCalledWith(
      { action: 'COLLECT', sourceIds: [2] },
      expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
    );

    act(() => {
      mockExecuteAction.mock.calls[0][1].onSuccess({
        acceptedAt: '2026-08-01T09:00:00',
        runIds: [10],
        status: 'PENDING',
      });
    });
    expect(mockUseTrackRuns).toHaveBeenLastCalledWith([10]);
  });

  it('새 수집원 응답에 없는 선택 ID는 수동 실행에 사용하지 않는다', () => {
    const { rerender } = render(<AdminCollectorManagementPage />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'JOB-ALIO 실행 대상 선택' }));
    mockUseSourceQuery.mockReturnValue({
      data: {
        sources: [
          {
            approvalStatus: 'READY',
            configured: true,
            dailyRequestLimit: 100,
            enabled: true,
            lastCollectedAt: null,
            lastError: null,
            lastFailureAt: null,
            lastSuccessAt: null,
            name: '나라일터',
            sourceCode: 'NARA_ILTEO',
            sourceId: 3,
            sourceType: 'EXTERNAL_API',
          },
        ],
      },
      isError: false,
      isLoading: false,
      refetch: mockSourceRefetch,
    });
    rerender(<AdminCollectorManagementPage />);

    expect(screen.getByRole('button', { name: '선택 수집원 실행' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '선택 수집원 실행' }));
    expect(mockExecuteAction).not.toHaveBeenCalled();
  });

  it('실행 이력 필터를 API Query와 URL에 반영한다', async () => {
    render(<AdminCollectorManagementPage />);

    fireEvent.click(screen.getByRole('combobox', { name: '수집원 필터' }));
    fireEvent.click(screen.getByRole('option', { name: 'JOB-ALIO' }));
    fireEvent.click(screen.getByRole('combobox', { name: '실행 상태 필터' }));
    fireEvent.click(screen.getByRole('option', { name: '실패' }));
    fireEvent.change(screen.getByLabelText('기간 시작'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('기간 종료'), { target: { value: '2026-08-31' } });

    expect(mockUseListQuery).toHaveBeenLastCalledWith(
      {
        endAt: '2026-08-31T23:59:59.999999999',
        page: 0,
        size: 5,
        sourceId: 2,
        startAt: '2026-08-01T00:00:00',
        status: 'FAILED',
      },
      { isEnabled: true },
    );
    await waitFor(() => {
      expect(mockReplace).toHaveBeenLastCalledWith(
        '/admin/collector?sourceId=2&status=FAILED&startDate=2026-08-01&endDate=2026-08-31',
        { scroll: false },
      );
    });
  });

  it('다음 페이지를 API Query와 URL에 반영한다', async () => {
    mockUseListQuery.mockReturnValue({
      data: { ...LIST_RESPONSE, first: true, last: false, totalElements: 6, totalPages: 2 },
      isError: false,
      isLoading: false,
      isPlaceholderData: false,
      refetch: mockListRefetch,
    });
    render(<AdminCollectorManagementPage />);

    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    expect(mockUseListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, size: 5 }),
      { isEnabled: true },
    );
    await waitFor(() => {
      expect(mockReplace).toHaveBeenLastCalledWith('/admin/collector?page=2', { scroll: false });
    });
  });

  it('목록 오류의 다시 시도를 Query refetch에 연결한다', () => {
    mockUseListQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      isPlaceholderData: false,
      refetch: mockListRefetch,
    });
    render(<AdminCollectorManagementPage />);

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(mockListRefetch).toHaveBeenCalledOnce();
  });
});
