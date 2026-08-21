import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { JobListPage } from './JobListPage';

const { mockUseJobListQuery, mockRouterReplace, mockUsePathname } = vi.hoisted(() => ({
  mockUseJobListQuery: vi.fn(),
  mockRouterReplace: vi.fn(),
  mockUsePathname: vi.fn(),
}));

vi.mock('@/entities/job', async () => {
  const actual = await vi.importActual<typeof import('@/entities/job')>('@/entities/job');
  return {
    ...actual,
    useJobListQuery: mockUseJobListQuery,
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
  usePathname: mockUsePathname,
}));

function emptyListResult() {
  return {
    data: {
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  };
}

/** router.replace에 마지막으로 넘긴 URL을 실제로 파싱해 파라미터를 읽는다(공백 인코딩 방식과 무관하게 비교하려고). */
function lastReplacedParams(): URLSearchParams {
  const lastUrl = mockRouterReplace.mock.calls.at(-1)?.[0] as string;
  return new URLSearchParams(lastUrl.split('?')[1] ?? '');
}

beforeEach(() => {
  mockUsePathname.mockReturnValue('/jobs');
  mockUseJobListQuery.mockReturnValue(emptyListResult());
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('JobListPage', () => {
  it('Server Component가 넘긴 초기 searchParams로 조회 상태를 복원한다', () => {
    render(
      <JobListPage initialSearchParams={{ q: '백엔드', page: '2', applyType: '외부 지원' }} />,
    );

    expect(mockUseJobListQuery).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, query: '백엔드', applicationMethod: 'EXTERNAL' }),
    );
  });

  it('"지원 유형"에서 외부 지원을 고르면 applicationMethod로 조회하고 URL에도 반영한다', () => {
    render(<JobListPage />);

    fireEvent.click(screen.getByRole('button', { name: '지원 유형' }));
    fireEvent.click(screen.getByRole('button', { name: '외부 지원' }));

    expect(mockUseJobListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ applicationMethod: 'EXTERNAL' }),
    );
    expect(lastReplacedParams().get('applyType')).toBe('외부 지원');
  });

  it('"모집 상태"에서 마감 임박을 골라도 조회 파라미터에는 반영하지 않는다(서버에 대응 값이 없음)', () => {
    render(<JobListPage />);

    fireEvent.click(screen.getByRole('button', { name: '모집 상태' }));
    fireEvent.click(screen.getByRole('button', { name: '마감 임박' }));

    const lastParams = mockUseJobListQuery.mock.calls.at(-1)?.[0];
    expect(lastParams.status).toBeUndefined();
  });

  it('검색어를 입력하면 디바운스 뒤 query와 URL을 갱신한다', () => {
    vi.useFakeTimers();
    render(<JobListPage />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '카카오' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockUseJobListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: '카카오' }),
    );
    expect(lastReplacedParams().get('q')).toBe('카카오');
  });
});
