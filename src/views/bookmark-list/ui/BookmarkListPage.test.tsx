import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BookmarkListPage } from './BookmarkListPage';

const { mockDeleteBookmarkMutateAsync, mockRouterReplace, mockUseBookmarkListQuery } = vi.hoisted(
  () => ({
    mockDeleteBookmarkMutateAsync: vi.fn(),
    mockRouterReplace: vi.fn(),
    mockUseBookmarkListQuery: vi.fn(),
  }),
);

vi.mock('next/navigation', () => ({
  usePathname: () => '/bookmarks',
  useRouter: () => ({ replace: mockRouterReplace }),
}));

vi.mock('@/entities/bookmark', async () => {
  const actual = await vi.importActual<typeof import('@/entities/bookmark')>('@/entities/bookmark');

  return {
    ...actual,
    useBookmarkListQuery: mockUseBookmarkListQuery,
    useDeleteBookmarkMutation: () => ({ mutateAsync: mockDeleteBookmarkMutateAsync }),
  };
});

vi.mock('@/widgets/site-header', () => ({
  SiteHeader: () => <header>GETI</header>,
}));

const BOOKMARKED_JOB = {
  jobId: 1,
  title: '백엔드 개발 인턴',
  postingType: 'GENERAL',
  applicationMethod: 'INTERNAL',
  status: 'PUBLISHED',
  company: { companyId: 1, name: '테스트 기업', logoUrl: null },
  endDate: '2026-09-30T23:59:59+09:00',
  viewCount: 10,
  bookmarked: true,
  techStacks: [],
  bookmarkCount: 3,
  location: '서울',
  employmentType: '인턴',
} as const;

function queryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      content: [BOOKMARKED_JOB],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    },
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mockDeleteBookmarkMutateAsync.mockReset();
  mockRouterReplace.mockReset();
  mockUseBookmarkListQuery.mockReset();
  mockUseBookmarkListQuery.mockReturnValue(queryResult());
});

describe('BookmarkListPage', () => {
  it('북마크 목록 API 결과를 카드로 표시한다', () => {
    render(<BookmarkListPage />);

    expect(screen.getByRole('link', { name: '백엔드 개발 인턴' })).toHaveAttribute(
      'href',
      '/jobs/school/1',
    );
    expect(mockUseBookmarkListQuery).toHaveBeenCalledWith({ page: 0, size: 20 });
  });

  it('기존 데이터의 백그라운드 갱신 중에는 목록을 유지한다', () => {
    mockUseBookmarkListQuery.mockReturnValue(queryResult({ isFetching: true }));

    render(<BookmarkListPage />);

    expect(screen.getByRole('link', { name: '백엔드 개발 인턴' })).toBeInTheDocument();
    expect(
      screen.queryByRole('status', { name: '북마크 목록을 불러오는 중' }),
    ).not.toBeInTheDocument();
  });

  it('페이지 전환의 이전 데이터는 목록 대신 로딩 상태로 표시한다', () => {
    mockUseBookmarkListQuery.mockReturnValue(
      queryResult({ isFetching: true, isPlaceholderData: true }),
    );

    render(<BookmarkListPage initialPage={1} />);

    expect(screen.getByRole('status', { name: '북마크 목록을 불러오는 중' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '백엔드 개발 인턴' })).not.toBeInTheDocument();
  });

  it('조회 오류는 목록 에러 상태로 표시한다', () => {
    mockUseBookmarkListQuery.mockReturnValue(
      queryResult({ data: undefined, error: new Error('failed'), isError: true }),
    );

    render(<BookmarkListPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('북마크한 공고를 불러오지 못했습니다.');
  });
});
