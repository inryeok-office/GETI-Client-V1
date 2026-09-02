import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRefetch, mockUseOperationJobsQuery } = vi.hoisted(() => ({
  mockRefetch: vi.fn(),
  mockUseOperationJobsQuery: vi.fn(),
}));

vi.mock('@/entities/scheduler', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/scheduler')>();
  return { ...actual, useOperationJobsQuery: mockUseOperationJobsQuery };
});

import { AdminSchedulerManagementPage } from './AdminSchedulerManagementPage';

function queryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      content: [],
      first: true,
      last: true,
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    },
    isError: false,
    isLoading: false,
    refetch: mockRefetch,
    ...overrides,
  };
}

describe('AdminSchedulerManagementPage', () => {
  beforeEach(() => {
    mockRefetch.mockReset();
    mockUseOperationJobsQuery.mockReset();
    mockUseOperationJobsQuery.mockReturnValue(queryResult());
  });

  it('정기 작업 조회 Query를 호출하고 빈 상태를 연결한다', () => {
    render(<AdminSchedulerManagementPage />);

    expect(mockUseOperationJobsQuery).toHaveBeenCalledWith({ page: 0, size: 20 });
    expect(screen.getByText('등록된 정기 작업이 없습니다.')).toBeInTheDocument();
  });

  it('조회 오류의 다시 시도를 Query refetch와 연결한다', () => {
    mockUseOperationJobsQuery.mockReturnValue(queryResult({ data: undefined, isError: true }));

    render(<AdminSchedulerManagementPage />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(mockRefetch).toHaveBeenCalledOnce();
  });

  it('조회 중에는 로딩 상태를 표시한다', () => {
    mockUseOperationJobsQuery.mockReturnValue(queryResult({ data: undefined, isLoading: true }));

    render(<AdminSchedulerManagementPage />);

    expect(
      screen.getByRole('status', { name: '정기 작업 목록을 불러오는 중' }),
    ).toBeInTheDocument();
  });
});
