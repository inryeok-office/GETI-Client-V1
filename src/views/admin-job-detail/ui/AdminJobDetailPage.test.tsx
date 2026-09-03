import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';
import type { AdminJobDetail } from '@/entities/job';

import { AdminJobDetailPage } from './AdminJobDetailPage';

/** `mockReanalyzeMutate`가 마지막으로 받은 콜백. onSuccess/onError를 직접 실행해 토스트를 검증한다. */
function lastReanalyzeCallbacks() {
  return mockReanalyzeMutate.mock.calls.at(-1)?.[1] as {
    onSuccess: () => void;
    onError: (error: unknown) => void;
  };
}

const {
  mockUseAdminJobDetailQuery,
  mockUseReanalyzeAdminJobMutation,
  mockReanalyzeMutate,
  mockRefetch,
} = vi.hoisted(() => ({
  mockUseAdminJobDetailQuery: vi.fn(),
  mockUseReanalyzeAdminJobMutation: vi.fn(),
  mockReanalyzeMutate: vi.fn(),
  mockRefetch: vi.fn(),
}));

vi.mock('@/entities/job', async () => {
  const actual = await vi.importActual<typeof import('@/entities/job')>('@/entities/job');
  return {
    ...actual,
    useAdminJobDetailQuery: mockUseAdminJobDetailQuery,
    useReanalyzeAdminJobMutation: mockUseReanalyzeAdminJobMutation,
  };
});

function detail(overrides: Partial<AdminJobDetail> = {}): AdminJobDetail {
  return {
    jobId: 1,
    title: '프론트엔드 개발자 채용',
    postingType: 'GENERAL',
    applicationMethod: 'EXTERNAL',
    status: 'PUBLISHED',
    company: { companyId: 1, name: '플로우테크', logoUrl: null },
    content: 'GETI 웹 서비스의 프론트엔드 기능을 설계하고 구현합니다.',
    externalUrl: null,
    startDate: null,
    endDate: null,
    targetGrade: null,
    capacity: null,
    location: null,
    employmentType: null,
    firstComeServed: false,
    viewCount: 0,
    publishedAt: '2026-08-01T09:00:00',
    closedAt: null,
    createdAt: '2026-07-20T10:00:00',
    updatedAt: '2026-08-01T08:58:37',
    aiAnalysis: {
      status: 'COMPLETED',
      isReanalysis: false,
      summary: null,
      requiredSkills: [
        { techStackId: 1, name: 'React' },
        { techStackId: 2, name: 'TypeScript' },
      ],
      preferredSkills: [],
      highSchoolGraduateFit: 'SUITABLE',
      entryLevelFit: 'SUITABLE',
      difficulty: 'NORMAL',
      canReanalyze: true,
      remainingReanalysisCount: 2,
      analyzedAt: '2026-08-01T09:12:00',
    },
    application: {
      canApply: false,
      eligibilityReason: 'JOB_NOT_PUBLISHED',
      eligibilityMessage: '',
      applicationId: null,
      applicationStatus: null,
      availableActions: [],
    },
    bookmarked: false,
    files: [],
    ...overrides,
  };
}

function queryResult(overrides: Partial<ReturnType<typeof idle>> = {}) {
  return { ...idle(), ...overrides };
}

function idle() {
  return { data: detail(), isLoading: false, isError: false, refetch: mockRefetch };
}

beforeEach(() => {
  mockUseAdminJobDetailQuery.mockReturnValue(queryResult());
  mockUseReanalyzeAdminJobMutation.mockReturnValue({
    mutate: mockReanalyzeMutate,
    isPending: false,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AdminJobDetailPage', () => {
  it('jobId가 정수가 아니면 조회하지 않고 오류 상태를 보여준다', () => {
    render(<AdminJobDetailPage jobId="abc" />);

    expect(mockUseAdminJobDetailQuery).toHaveBeenCalledWith(null);
    expect(screen.getByText('공고 정보를 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('로딩 중이면 로딩 상태를 보여준다', () => {
    mockUseAdminJobDetailQuery.mockReturnValue(queryResult({ isLoading: true, data: undefined }));

    render(<AdminJobDetailPage jobId="1" />);

    expect(screen.getByText('공고 정보를 불러오는 중입니다.')).toBeInTheDocument();
  });

  it('조회 실패 시 다시 시도 버튼을 누르면 refetch한다', () => {
    mockUseAdminJobDetailQuery.mockReturnValue(queryResult({ isError: true, data: undefined }));

    render(<AdminJobDetailPage jobId="1" />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('조회 성공 시 제목·부제목·공고 정보·AI 분석 결과를 보여준다', () => {
    render(<AdminJobDetailPage jobId="1" />);

    expect(
      screen.getByRole('heading', { name: '프론트엔드 개발자 채용', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('플로우테크 · 공개 · 모집 중')).toBeInTheDocument();
    expect(screen.getByText('React · TypeScript')).toBeInTheDocument();
    expect(screen.getByText('2026.08.01 08:58')).toBeInTheDocument();
    expect(screen.getByText('분석 완료 · 2026.08.01 09:12')).toBeInTheDocument();
    expect(screen.getByText('남은 재분석 2회')).toBeInTheDocument();
  });

  it('임시저장 공고는 부제목에서 마감 상태를 빼고 "비공개"로 표시한다', () => {
    mockUseAdminJobDetailQuery.mockReturnValue(
      queryResult({ data: detail({ status: 'DRAFT', aiAnalysis: null }) }),
    );

    render(<AdminJobDetailPage jobId="1" />);

    expect(screen.getByText('플로우테크 · 비공개')).toBeInTheDocument();
    expect(screen.getByText('AI 분석 전')).toBeInTheDocument();
  });

  it('삭제된 공고는 안내 배너를 보여준다', () => {
    mockUseAdminJobDetailQuery.mockReturnValue(
      queryResult({ data: detail({ status: 'DELETED' }) }),
    );

    render(<AdminJobDetailPage jobId="1" />);

    expect(screen.getByText(/삭제된 공고입니다/)).toBeInTheDocument();
  });

  it('canReanalyze면 "AI 재분석" 버튼을 눌러 jobId로 뮤테이션을 호출하고, 성공 시 토스트를 띄운다', () => {
    render(<AdminJobDetailPage jobId="1" />);

    const button = screen.getByRole('button', { name: 'AI 재분석' });
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(mockReanalyzeMutate).toHaveBeenCalledWith(1, expect.anything());

    act(() => lastReanalyzeCallbacks().onSuccess());
    expect(
      screen.getByText('AI 재분석을 요청했습니다. 잠시 후 결과가 갱신됩니다.'),
    ).toBeInTheDocument();
  });

  it.each([
    [409, '이미 분석이 진행 중입니다.'],
    [429, '재분석 횟수를 모두 사용했습니다.'],
    [503, 'AI 분석 서비스를 일시적으로 사용할 수 없습니다.'],
  ])('재분석 실패(%s) 시 서버 메시지를 오류 토스트로 띄운다', (statusCode, message) => {
    render(<AdminJobDetailPage jobId="1" />);

    fireEvent.click(screen.getByRole('button', { name: 'AI 재분석' }));
    act(() => lastReanalyzeCallbacks().onError(new ApiError(message, statusCode)));

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('canReanalyze가 false면 "AI 재분석" 버튼이 비활성이다', () => {
    mockUseAdminJobDetailQuery.mockReturnValue(
      queryResult({
        data: detail({
          aiAnalysis: { ...detail().aiAnalysis!, canReanalyze: false, status: 'PROCESSING' },
        }),
      }),
    );

    render(<AdminJobDetailPage jobId="1" />);

    expect(screen.getByRole('button', { name: 'AI 재분석' })).toBeDisabled();
  });

  it('재분석 요청 중이면 버튼이 "요청 중…"으로 잠긴다', () => {
    mockUseReanalyzeAdminJobMutation.mockReturnValue({
      mutate: mockReanalyzeMutate,
      isPending: true,
    });

    render(<AdminJobDetailPage jobId="1" />);

    expect(screen.getByRole('button', { name: '요청 중…' })).toBeDisabled();
  });

  it('브레드크럼은 backHref로 이동한다(목록 조회 조건 유지)', () => {
    render(<AdminJobDetailPage jobId="1" backHref="/admin/jobs?q=백엔드&deadline=closed&page=2" />);

    expect(screen.getByRole('link', { name: '공고 관리' })).toHaveAttribute(
      'href',
      '/admin/jobs?q=백엔드&deadline=closed&page=2',
    );
  });

  it('backHref가 없으면 기본 목록 경로로 이동한다', () => {
    render(<AdminJobDetailPage jobId="1" />);

    expect(screen.getByRole('link', { name: '공고 관리' })).toHaveAttribute('href', '/admin/jobs');
  });
});
