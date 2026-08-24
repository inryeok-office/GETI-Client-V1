import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { JobListPage } from './JobListPage';

const { mockUseJobListQuery, mockUseJobSourcesQuery, mockRouterReplace, mockUsePathname } =
  vi.hoisted(() => ({
    mockUseJobListQuery: vi.fn(),
    mockUseJobSourcesQuery: vi.fn(),
    mockRouterReplace: vi.fn(),
    mockUsePathname: vi.fn(),
  }));

vi.mock('@/entities/job', async () => {
  const actual = await vi.importActual<typeof import('@/entities/job')>('@/entities/job');
  return {
    ...actual,
    useJobListQuery: mockUseJobListQuery,
    useJobSourcesQuery: mockUseJobSourcesQuery,
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

const DEFAULT_SOURCES = [
  { sourceId: 1, sourceCode: 'SARAMIN', name: '사람인', active: true },
  { sourceId: 2, sourceCode: 'MMA', name: '고용24', active: true },
];

interface SourcesResultOverrides {
  data?: typeof DEFAULT_SOURCES;
  isLoading?: boolean;
  isError?: boolean;
}

function sourcesResult(overrides: SourcesResultOverrides = {}) {
  return {
    data: DEFAULT_SOURCES,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
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
  mockUseJobSourcesQuery.mockReturnValue(sourcesResult());
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
      expect.anything(),
    );
  });

  it('"지원 유형"에서 외부 지원을 고르면 applicationMethod로 조회하고 URL에도 반영한다', () => {
    render(<JobListPage />);

    fireEvent.click(screen.getByRole('button', { name: '지원 유형' }));
    fireEvent.click(screen.getByRole('button', { name: '외부 지원' }));

    expect(mockUseJobListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ applicationMethod: 'EXTERNAL' }),
      expect.anything(),
    );
    expect(lastReplacedParams().get('applyType')).toBe('외부 지원');
  });

  it('"모집 상태"의 마감 임박 옵션은 비활성화되어 선택되지 않는다(서버에 대응 값이 없음)', () => {
    render(<JobListPage />);

    fireEvent.click(screen.getByRole('button', { name: '모집 상태' }));
    fireEvent.click(screen.getByRole('button', { name: '마감 임박' }));

    const lastParams = mockUseJobListQuery.mock.calls.at(-1)?.[0];
    expect(lastParams.status).toBeUndefined();
    expect(lastReplacedParams().get('status')).toBeNull();
  });

  it('"직무" · "기업 유형" 버튼은 비활성화되어 있다(대응하는 조회 파라미터가 없음)', () => {
    render(<JobListPage />);

    expect(screen.getByRole('button', { name: '직무' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '기업 유형' })).toBeDisabled();
  });

  it('"출처"에서 사람인을 고르면 sourceName(sourceCode)으로 조회하고 URL에는 표시명을 반영한다', () => {
    render(<JobListPage />);

    fireEvent.click(screen.getByRole('button', { name: '출처' }));
    fireEvent.click(screen.getByRole('button', { name: '사람인' }));

    expect(mockUseJobListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ sourceName: 'SARAMIN' }),
      expect.anything(),
    );
    expect(lastReplacedParams().get('source')).toBe('사람인');
  });

  it('출처가 이미 선택된 URL로 들어오면 출처 목록을 불러오는 동안 목록 조회를 미룬다(전체 목록이 먼저 나가지 않도록)', () => {
    mockUseJobSourcesQuery.mockReturnValue(sourcesResult({ isLoading: true, data: undefined }));
    render(<JobListPage initialSearchParams={{ source: '사람인' }} />);

    expect(mockUseJobListQuery).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ enabled: false }),
    );
  });

  it('출처가 이미 선택된 URL로 들어와도 출처 목록을 다 불러오면 sourceName으로 목록 조회가 활성화된다', () => {
    mockUseJobSourcesQuery.mockReturnValue(sourcesResult());
    render(<JobListPage initialSearchParams={{ source: '사람인' }} />);

    expect(mockUseJobListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ sourceName: 'SARAMIN' }),
      expect.objectContaining({ enabled: true }),
    );
  });

  it('출처 목록을 불러오는 중에는 "출처" 버튼이 비활성화된다', () => {
    mockUseJobSourcesQuery.mockReturnValue(sourcesResult({ isLoading: true }));
    render(<JobListPage />);

    expect(screen.getByRole('button', { name: '출처 불러오는 중...' })).toBeDisabled();
  });

  it('출처 목록 조회에 실패하면 재시도 버튼을 누를 때 refetch를 호출한다', () => {
    const errorResult = sourcesResult({ isError: true });
    mockUseJobSourcesQuery.mockReturnValue(errorResult);
    render(<JobListPage />);

    const retryButton = screen.getByRole('button', {
      name: '출처 목록을 불러오지 못했습니다. 다시 시도',
    });
    expect(retryButton).not.toBeDisabled();

    fireEvent.click(retryButton);
    expect(errorResult.refetch).toHaveBeenCalledTimes(1);
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
      expect.anything(),
    );
    expect(lastReplacedParams().get('q')).toBe('카카오');
  });

  it('URL로 복원한 page는 최초 마운트 후 디바운스 시점(300ms)이 지나도 그대로 유지된다', () => {
    vi.useFakeTimers();
    render(<JobListPage initialSearchParams={{ page: '2' }} />);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockUseJobListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1 }),
      expect.anything(),
    );
    expect(lastReplacedParams().get('page')).toBe('2');
  });

  it('StrictMode의 effect 이중 실행에서도 URL로 복원한 page가 유지된다', () => {
    vi.useFakeTimers();
    render(
      <StrictMode>
        <JobListPage initialSearchParams={{ page: '2' }} />
      </StrictMode>,
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockUseJobListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1 }),
      expect.anything(),
    );
    expect(lastReplacedParams().get('page')).toBe('2');
  });
});
