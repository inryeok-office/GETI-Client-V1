import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { JobSummary } from '@/entities/job';

import { AdminJobListPage } from './AdminJobListPage';

const { mockUseJobListQuery, mockReplace, mockRefetch } = vi.hoisted(() => ({
  mockUseJobListQuery: vi.fn(),
  mockReplace: vi.fn(),
  mockRefetch: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/admin/jobs',
}));

vi.mock('@/entities/job', async () => {
  const actual = await vi.importActual<typeof import('@/entities/job')>('@/entities/job');
  return { ...actual, useJobListQuery: mockUseJobListQuery };
});

function jobSummary(overrides: Partial<JobSummary> = {}): JobSummary {
  return {
    jobId: 1,
    title: '프론트엔드 개발자 채용',
    postingType: 'GENERAL',
    applicationMethod: 'EXTERNAL',
    status: 'PUBLISHED',
    company: { companyId: 1, name: '플로우테크', logoUrl: null },
    startDate: null,
    endDate: null,
    targetGrade: null,
    capacity: null,
    location: null,
    employmentType: null,
    firstComeServed: false,
    viewCount: 0,
    publishedAt: '2026-08-01T09:00:00',
    application: {
      canApply: false,
      eligibilityReason: 'JOB_NOT_PUBLISHED',
      eligibilityMessage: '',
      applicationId: null,
      applicationStatus: null,
      availableActions: [],
    },
    bookmarked: false,
    ...overrides,
  };
}

function listResult(overrides: Partial<ReturnType<typeof idleList>> = {}) {
  return { ...idleList(), ...overrides };
}

function idleList() {
  return {
    data: {
      content: [jobSummary()],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    },
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  };
}

beforeEach(() => {
  mockUseJobListQuery.mockReturnValue(listResult());
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AdminJobListPage', () => {
  it('조회 성공 시 총 개수와 공고 행을 보여준다', () => {
    render(<AdminJobListPage />);

    expect(screen.getByRole('heading', { name: '공고 관리', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('총 1개 공고')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '프론트엔드 개발자 채용' })).toHaveAttribute(
      'href',
      '/admin/jobs/1',
    );
  });

  it('로딩 중이면 로딩 상태를 보여준다', () => {
    mockUseJobListQuery.mockReturnValue(listResult({ isLoading: true, data: undefined }));

    render(<AdminJobListPage />);

    expect(screen.getByText('공고 목록을 불러오는 중입니다.')).toBeInTheDocument();
  });

  it('조회 실패 시 다시 시도 버튼을 누르면 refetch한다', () => {
    mockUseJobListQuery.mockReturnValue(listResult({ isError: true, data: undefined }));

    render(<AdminJobListPage />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('결과가 없고 필터도 없으면 기본 빈 상태 문구를 보여준다', () => {
    mockUseJobListQuery.mockReturnValue(
      listResult({
        data: {
          content: [],
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
        },
      }),
    );

    render(<AdminJobListPage />);

    expect(screen.getByText('등록된 공고가 없습니다.')).toBeInTheDocument();
  });

  it('초기 검색어가 있으면 그 값으로 목록을 조회한다', () => {
    render(<AdminJobListPage initialSearchParams={{ q: '백엔드' }} />);

    expect(mockUseJobListQuery).toHaveBeenCalledWith(
      expect.objectContaining({ query: '백엔드', page: 0, size: 20 }),
    );
  });

  it('초기 마감 상태 필터(closed)를 status=CLOSED로 넘긴다', () => {
    render(<AdminJobListPage initialSearchParams={{ deadline: 'closed' }} />);

    expect(mockUseJobListQuery).toHaveBeenCalledWith(expect.objectContaining({ status: 'CLOSED' }));
  });

  it('"공고 등록" 버튼은 이번 범위에서 비활성이다', () => {
    render(<AdminJobListPage />);

    expect(screen.getByRole('button', { name: '공고 등록' })).toBeDisabled();
  });

  it('URL page가 totalPages를 벗어나면 마지막 유효 페이지로 보정한다', () => {
    mockUseJobListQuery.mockReturnValue(
      listResult({
        data: {
          content: [],
          page: 998,
          size: 20,
          totalElements: 25,
          totalPages: 2,
          first: false,
          last: true,
        },
      }),
    );

    render(<AdminJobListPage initialSearchParams={{ page: '999' }} />);

    // 보정 effect가 setPage(1)을 호출해 page: 1로 재조회한다.
    const lastCall = mockUseJobListQuery.mock.calls.at(-1)?.[0];
    expect(lastCall).toMatchObject({ page: 1 });
  });

  it('결과가 없고 페이지가 0이 아니면 "첫 페이지로" 버튼을 제공한다', () => {
    mockUseJobListQuery.mockReturnValue(
      listResult({
        data: {
          content: [],
          page: 1,
          size: 20,
          totalElements: 60,
          totalPages: 3,
          first: false,
          last: false,
        },
      }),
    );

    render(<AdminJobListPage initialSearchParams={{ page: '2' }} />);

    fireEvent.click(screen.getByRole('button', { name: '첫 페이지로' }));

    const lastCall = mockUseJobListQuery.mock.calls.at(-1)?.[0];
    expect(lastCall).toMatchObject({ page: 0 });
  });
});
