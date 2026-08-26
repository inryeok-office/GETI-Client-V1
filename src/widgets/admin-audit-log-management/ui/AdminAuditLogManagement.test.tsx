import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminAuditLogManagement } from './AdminAuditLogManagement';

const { mockDetailQuery, mockListQuery, mockRouterReplace } = vi.hoisted(() => ({
  mockDetailQuery: vi.fn(),
  mockListQuery: vi.fn(),
  mockRouterReplace: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/audit-logs',
  useRouter: () => ({ replace: mockRouterReplace }),
}));

vi.mock('@/entities/audit-log', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/audit-log')>();
  return {
    ...actual,
    useAdminAuditLogDetailQuery: mockDetailQuery,
    useAdminAuditLogListQuery: mockListQuery,
  };
});

const LIST_ITEM = {
  actionType: 'UPDATE',
  actorId: 7,
  actorName: '개발자',
  auditLogId: 100,
  createdAt: '2026-08-01T14:32:18',
  maskedDetail: '공고 공개 상태 변경',
  requestPath: '/api/v1/admin/jobs/81',
  result: 'SUCCESS' as const,
  targetId: 81,
  targetType: 'JOB',
};

const DETAIL = {
  ...LIST_ITEM,
  changes: [{ after: '공개', before: '비공개', field: '공개 상태' }],
};

function successListQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      content: [LIST_ITEM],
      first: true,
      last: true,
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    },
    isError: false,
    isLoading: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mockDetailQuery.mockReset();
  mockListQuery.mockReset();
  mockRouterReplace.mockReset();

  mockListQuery.mockReturnValue(successListQuery());
  mockDetailQuery.mockImplementation((auditLogId: number | null) => ({
    data: auditLogId === null ? undefined : DETAIL,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }));
});

describe('AdminAuditLogManagement', () => {
  it('서버 목록 모델과 전체 건수를 표시한다', () => {
    render(<AdminAuditLogManagement />);

    expect(screen.getByRole('heading', { name: '감사 로그', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('총 1건')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '감사 로그 작업 실행 이력' })).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('공고 공개 상태 변경')).toBeInTheDocument();
  });

  it('검색 조건을 서버 Query와 URL에 전달한다', async () => {
    render(<AdminAuditLogManagement />);

    fireEvent.change(screen.getByLabelText('기간 시작'), { target: { value: '20260801' } });
    fireEvent.change(screen.getByLabelText('기간 종료'), { target: { value: '20260831' } });
    fireEvent.change(screen.getByLabelText('작업자'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('대상'), { target: { value: '81' } });
    fireEvent.click(screen.getByRole('combobox', { name: '작업 유형' }));
    fireEvent.click(screen.getByRole('option', { name: 'COMPANY_UPDATED' }));
    fireEvent.click(screen.getByRole('combobox', { name: '결과' }));
    fireEvent.click(screen.getByRole('option', { name: '실패' }));

    await waitFor(() => {
      expect(mockListQuery).toHaveBeenLastCalledWith(
        {
          actionType: 'COMPANY_UPDATED',
          actorId: 7,
          endAt: '2026-08-31T23:59:59.999999999',
          page: 0,
          result: 'FAILURE',
          size: 20,
          startAt: '2026-08-01T00:00:00',
          targetId: 81,
        },
        { isEnabled: true },
      );
    });
    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenLastCalledWith(
        '/admin/audit-logs?startDate=2026.08.01&endDate=2026.08.31&actorId=7&actionType=COMPANY_UPDATED&targetId=81&result=FAILED',
        { scroll: false },
      );
    });
  });

  it('URL의 페이지 크기를 검증해 서버 Query와 URL에 유지한다', async () => {
    mockListQuery.mockReturnValue(
      successListQuery({
        data: {
          content: [LIST_ITEM],
          first: false,
          last: false,
          page: 1,
          size: 50,
          totalElements: 150,
          totalPages: 3,
        },
      }),
    );

    render(<AdminAuditLogManagement initialSearchParams={{ page: '2', size: '50' }} />);

    expect(mockListQuery).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, size: 50 }), {
      isEnabled: true,
    });
    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenLastCalledWith('/admin/audit-logs?page=2&size=50', {
        scroll: false,
      });
    });
  });

  it('허용 범위를 벗어난 페이지 크기는 기본값으로 조회한다', () => {
    render(<AdminAuditLogManagement initialSearchParams={{ size: '101' }} />);

    expect(mockListQuery).toHaveBeenLastCalledWith(expect.objectContaining({ size: 20 }), {
      isEnabled: true,
    });
  });

  it('잘못된 기간은 안내하고 서버 Query에 전달하지 않는다', async () => {
    const user = userEvent.setup();
    render(<AdminAuditLogManagement />);

    await user.type(screen.getByLabelText('기간 시작'), '20260802');
    await user.type(screen.getByLabelText('기간 종료'), '20260801');

    expect(screen.getByText('종료일은 시작일보다 빠를 수 없습니다.')).toBeInTheDocument();
    expect(mockListQuery).toHaveBeenLastCalledWith(expect.any(Object), { isEnabled: false });
    expect(screen.getByText('검색 기간을 확인해 주세요.')).toBeInTheDocument();
    expect(screen.queryByText('총 1건')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: '감사 로그 작업 실행 이력' }),
    ).not.toBeInTheDocument();
  });

  it('안전한 정수 범위를 벗어난 ID는 안내하고 서버 Query에 전달하지 않는다', async () => {
    const user = userEvent.setup();
    render(<AdminAuditLogManagement />);

    await user.type(screen.getByLabelText('작업자'), '9007199254740992');

    expect(screen.getByText('처리할 수 있는 회원 ID 범위를 초과했습니다.')).toBeInTheDocument();
    expect(mockListQuery).toHaveBeenLastCalledWith(expect.any(Object), { isEnabled: false });
    expect(screen.getByText('검색 ID를 확인해 주세요.')).toBeInTheDocument();
  });

  it('텍스트 필터를 300ms 디바운스해 서버 Query에 전달한다', () => {
    vi.useFakeTimers();
    const { unmount } = render(<AdminAuditLogManagement initialSearchParams={{ page: '2' }} />);

    try {
      mockListQuery.mockClear();
      fireEvent.change(screen.getByLabelText('작업자'), { target: { value: '7' } });
      fireEvent.change(screen.getByLabelText('작업자'), { target: { value: '71' } });

      expect(mockListQuery).not.toHaveBeenCalledWith(
        expect.objectContaining({ actorId: 71 }),
        expect.any(Object),
      );
      expect(mockListQuery).toHaveBeenLastCalledWith(
        expect.objectContaining({ actorId: undefined, page: 0 }),
        { isEnabled: false },
      );

      act(() => vi.advanceTimersByTime(300));

      expect(mockListQuery).toHaveBeenLastCalledWith(expect.objectContaining({ actorId: 71 }), {
        isEnabled: true,
      });
    } finally {
      unmount();
      vi.useRealTimers();
    }
  });

  it('작업 유형 선택은 디바운스하지 않고 서버 Query에 전달한다', () => {
    render(<AdminAuditLogManagement />);
    mockListQuery.mockClear();

    fireEvent.click(screen.getByRole('combobox', { name: '작업 유형' }));
    fireEvent.click(screen.getByRole('option', { name: 'COMPANY_UPDATED' }));

    expect(mockListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ actionType: 'COMPANY_UPDATED' }),
      { isEnabled: true },
    );
  });

  it('상세 보기를 누르면 실제 상세와 변경 항목을 표시한다', async () => {
    const user = userEvent.setup();
    render(<AdminAuditLogManagement />);

    await user.click(screen.getByRole('button', { name: '상세 보기' }));

    const dialog = screen.getByRole('dialog', { name: '감사 로그 상세' });
    expect(mockDetailQuery).toHaveBeenLastCalledWith(100);
    expect(within(dialog).getByText('개발자 · #7')).toBeInTheDocument();
    expect(within(dialog).getByText('비공개')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: '상세 패널 닫기' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('목록 오류 상태에서 실제 Query를 다시 요청한다', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockListQuery.mockReturnValue(successListQuery({ data: undefined, isError: true, refetch }));

    render(<AdminAuditLogManagement />);
    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(refetch).toHaveBeenCalledOnce();
  });

  it('상세 오류 상태에서 상세 Query를 다시 요청한다', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockDetailQuery.mockImplementation((auditLogId: number | null) => ({
      data: undefined,
      isError: auditLogId !== null,
      isLoading: false,
      refetch,
    }));

    render(<AdminAuditLogManagement />);
    await user.click(screen.getByRole('button', { name: '상세 보기' }));

    expect(screen.getByRole('dialog', { name: '감사 로그 상세 조회 오류' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('상세를 불러오는 동안 로딩 패널을 표시한다', async () => {
    const user = userEvent.setup();
    mockDetailQuery.mockImplementation((auditLogId: number | null) => ({
      data: undefined,
      isError: false,
      isLoading: auditLogId !== null,
      refetch: vi.fn(),
    }));

    render(<AdminAuditLogManagement />);
    await user.click(screen.getByRole('button', { name: '상세 보기' }));

    const dialog = screen.getByRole('dialog', { name: '감사 로그 상세를 불러오는 중' });
    expect(
      within(dialog).getByRole('status', { name: '감사 로그 상세를 불러오는 중' }),
    ).toBeInTheDocument();
  });

  it('다음 페이지를 누르면 서버의 다음 페이지를 조회한다', async () => {
    const user = userEvent.setup();
    mockListQuery.mockReturnValue(
      successListQuery({
        data: {
          content: [LIST_ITEM],
          first: true,
          last: false,
          page: 0,
          size: 20,
          totalElements: 21,
          totalPages: 2,
        },
      }),
    );

    render(<AdminAuditLogManagement />);
    await user.click(screen.getByRole('button', { name: '다음' }));

    expect(mockListQuery).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }), {
      isEnabled: true,
    });
  });

  it('현재 페이지가 서버의 마지막 페이지를 벗어나면 유효한 마지막 페이지로 보정한다', async () => {
    mockListQuery.mockReturnValue(
      successListQuery({
        data: {
          content: [LIST_ITEM],
          first: false,
          last: true,
          page: 4,
          size: 20,
          totalElements: 21,
          totalPages: 2,
        },
      }),
    );

    render(<AdminAuditLogManagement initialSearchParams={{ page: '5' }} />);

    await waitFor(() => {
      expect(mockListQuery).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }), {
        isEnabled: true,
      });
    });
  });

  it.each([
    ['loading', '감사 로그를 불러오는 중'],
    ['empty', '감사 로그가 없습니다.'],
  ] as const)('%s 상태를 표시한다', (status, accessibleName) => {
    mockListQuery.mockReturnValue(
      successListQuery({
        data:
          status === 'empty'
            ? {
                content: [],
                first: true,
                last: true,
                page: 0,
                size: 20,
                totalElements: 0,
                totalPages: 0,
              }
            : undefined,
        isLoading: status === 'loading',
      }),
    );

    render(<AdminAuditLogManagement />);

    if (status === 'loading') {
      expect(screen.getByRole('status', { name: accessibleName })).toBeInTheDocument();
      return;
    }
    expect(screen.getByText(accessibleName)).toBeInTheDocument();
  });
});
