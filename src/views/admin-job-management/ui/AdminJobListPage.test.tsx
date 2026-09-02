import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';
import type { JobSummary } from '@/entities/job';

import { AdminJobListPage } from './AdminJobListPage';

const {
  mockUseJobListQuery,
  mockUseChangeAdminJobStatusMutation,
  mockMutate,
  mockReplace,
  mockRefetch,
} = vi.hoisted(() => ({
  mockUseJobListQuery: vi.fn(),
  mockUseChangeAdminJobStatusMutation: vi.fn(),
  mockMutate: vi.fn(),
  mockReplace: vi.fn(),
  mockRefetch: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/admin/jobs',
}));

vi.mock('@/entities/job', async () => {
  const actual = await vi.importActual<typeof import('@/entities/job')>('@/entities/job');
  return {
    ...actual,
    useJobListQuery: mockUseJobListQuery,
    useChangeAdminJobStatusMutation: mockUseChangeAdminJobStatusMutation,
  };
});

/** `mockMutate`가 마지막으로 받은 콜백. `onSuccess`/`onError`를 직접 실행해 완료 흐름을 검증한다. */
function lastMutateCallbacks() {
  return mockMutate.mock.calls.at(-1)?.[1] as {
    onSuccess: () => void;
    onError: (error: unknown) => void;
  };
}

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

function mutationResult(overrides: Record<string, unknown> = {}) {
  return { mutate: mockMutate, isPending: false, variables: undefined, ...overrides };
}

beforeEach(() => {
  mockUseJobListQuery.mockReturnValue(listResult());
  mockUseChangeAdminJobStatusMutation.mockReturnValue(mutationResult());
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

  it('"마감" 클릭 → CLOSED 뮤테이션 호출, 성공 콜백 실행 시 토스트를 띄운다', () => {
    render(<AdminJobListPage />);

    fireEvent.click(screen.getByRole('button', { name: '마감' }));
    expect(mockMutate).toHaveBeenCalledWith(
      { jobId: 1, status: 'CLOSED' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );

    act(() => lastMutateCallbacks().onSuccess());
    expect(screen.getByText('"프론트엔드 개발자 채용" 공고를 마감했습니다.')).toBeInTheDocument();
  });

  it('"삭제"는 확인 모달을 거쳐 DELETED 뮤테이션을 호출하고, 취소 시 아무 일도 없다', () => {
    render(<AdminJobListPage />);

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    const dialog = screen.getByRole('dialog', { name: '공고 삭제' });
    expect(dialog).toHaveTextContent('프론트엔드 개발자 채용 공고를 삭제하시겠습니까?');

    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(mockMutate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    fireEvent.click(
      screen.getAllByRole('button', { name: '삭제' }).find((el) => el.closest('[role="dialog"]'))!,
    );
    expect(mockMutate).toHaveBeenCalledWith({ jobId: 1, status: 'DELETED' }, expect.anything());
  });

  it('상태 변경이 진행 중인 행의 마감·삭제 버튼은 잠긴다', () => {
    mockUseChangeAdminJobStatusMutation.mockReturnValue(
      mutationResult({ isPending: true, variables: { jobId: 1, status: 'DELETED' } }),
    );

    render(<AdminJobListPage />);

    expect(screen.getByRole('button', { name: '마감' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled();
  });

  it('마지막 공고를 삭제해 목록이 빈 상태로 바뀌어도 성공 토스트가 유지된다', () => {
    render(<AdminJobListPage />);

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    fireEvent.click(
      screen.getAllByRole('button', { name: '삭제' }).find((el) => el.closest('[role="dialog"]'))!,
    );

    // 삭제 성공 → 목록이 빈 응답으로 갱신되는 상황
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
    act(() => lastMutateCallbacks().onSuccess());

    expect(screen.getByText('등록된 공고가 없습니다.')).toBeInTheDocument();
    // 표(AdminJobTable)가 언마운트돼도 상위의 AppToaster가 남아 토스트가 보인다.
    expect(screen.getByText('"프론트엔드 개발자 채용" 공고를 삭제했습니다.')).toBeInTheDocument();
  });

  it('상태 변경 실패 시 오류 토스트를 띄운다', () => {
    render(<AdminJobListPage />);

    fireEvent.click(screen.getByRole('button', { name: '마감' }));
    act(() => lastMutateCallbacks().onError(new ApiError('허용되지 않은 상태 전이입니다.', 409)));

    expect(screen.getByText('허용되지 않은 상태 전이입니다.')).toBeInTheDocument();
  });
});
