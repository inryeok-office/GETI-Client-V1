import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { JobDetail, JobSourceOption } from '@/entities/job';

import { ExternalJobDetailPage } from './ExternalJobDetailPage';

/** `AttachmentList`가 실제 `useDownloadJobAttachmentMutation`(TanStack Query)을 쓰므로 필요하다. */
function renderPage(jobId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ExternalJobDetailPage jobId={jobId} />
    </QueryClientProvider>,
  );
}

const { mockUseJobDetailQuery, mockUseJobSourcesQuery } = vi.hoisted(() => ({
  mockUseJobDetailQuery: vi.fn(),
  mockUseJobSourcesQuery: vi.fn(),
}));

vi.mock('@/entities/job', async () => {
  const actual = await vi.importActual<typeof import('@/entities/job')>('@/entities/job');
  return {
    ...actual,
    useJobDetailQuery: mockUseJobDetailQuery,
    useJobSourcesQuery: mockUseJobSourcesQuery,
  };
});

vi.mock('@/widgets/site-header', () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}));

const BASE_JOB: JobDetail = {
  jobId: 1,
  title: '백엔드 개발 인턴',
  postingType: 'GENERAL',
  applicationMethod: 'EXTERNAL',
  jobRole: 'BACKEND',
  status: 'PUBLISHED',
  company: { companyId: 1, name: '카카오', logoUrl: null },
  content: '본문',
  externalUrl: 'https://careers.example.com/1',
  startDate: '2026-08-01',
  endDate: '2026-12-01',
  targetGrade: null,
  capacity: null,
  location: '서울',
  employmentType: '인턴',
  sourceName: 'SARAMIN',
  firstComeServed: false,
  viewCount: 10,
  publishedAt: '2026-08-01T00:00:00Z',
  closedAt: null,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
  aiAnalysis: null,
  // 외부 공고는 서버 computeEligibilityReason이 늘 NOT_INTERNAL/canApply:false를 내려준다 —
  // 이 값 자체를 지원 버튼 활성 조건에 써서는 안 된다는 게 이번 회귀 테스트의 핵심이다.
  application: {
    canApply: false,
    eligibilityReason: 'NOT_INTERNAL',
    eligibilityMessage: '내부 지원 대상이 아닙니다.',
    applicationId: null,
    applicationStatus: null,
    availableActions: [],
  },
  bookmarked: false,
  files: [],
};

function mockJob(overrides: Partial<JobDetail> = {}) {
  mockUseJobDetailQuery.mockReturnValue({
    data: { ...BASE_JOB, ...overrides },
    isLoading: false,
    isError: false,
  });
}

function mockJobSources(data: JobSourceOption[] = []) {
  mockUseJobSourcesQuery.mockReturnValue({ data, isLoading: false, isError: false });
}

const SARAMIN_SOURCE: JobSourceOption = {
  sourceId: 1,
  sourceCode: 'SARAMIN',
  name: '사람인',
  active: true,
};

beforeEach(() => {
  mockJobSources([SARAMIN_SOURCE]);
});

describe('ExternalJobDetailPage', () => {
  it('canApply가 false여도 마감 전이고 externalUrl이 있으면 지원 버튼을 활성화한다', () => {
    mockJob();

    renderPage('1');

    const applyLink = screen.getByRole('link', { name: '사이트에서 지원하기' });
    expect(applyLink).toHaveAttribute('href', BASE_JOB.externalUrl);
  });

  it('마감된 공고는 지원 버튼을 비활성화한다', () => {
    mockJob({ status: 'CLOSED' });

    renderPage('1');

    expect(screen.getByRole('button', { name: '사이트에서 지원하기' })).toBeDisabled();
  });

  it('externalUrl이 없으면 지원 버튼을 비활성화한다', () => {
    mockJob({ externalUrl: null });

    renderPage('1');

    expect(screen.getByRole('button', { name: '사이트에서 지원하기' })).toBeDisabled();
  });

  it('"지원 유형" 행에 applicationMethod 표시 문구를 보여준다', () => {
    mockJob();

    renderPage('1');

    expect(screen.getByText('지원 유형')).toBeInTheDocument();
    expect(screen.getByText('외부 지원')).toBeInTheDocument();
  });

  it('"공고 출처" 행에 sourceName을 출처 목록에서 역조회한 표시명으로 보여준다', () => {
    mockJob({ sourceName: 'SARAMIN' });

    renderPage('1');

    expect(screen.getByText('공고 출처')).toBeInTheDocument();
    expect(screen.getByText('사람인')).toBeInTheDocument();
  });

  it('출처 목록에 없거나 아직 로딩 중이면 sourceName 코드를 그대로 보여준다', () => {
    mockJobSources([]);
    mockJob({ sourceName: 'SARAMIN' });

    renderPage('1');

    expect(screen.getByText('SARAMIN')).toBeInTheDocument();
  });

  it('sourceName이 null인 직접 등록 공고는 "공고 출처" 행을 감춘다', () => {
    mockJob({ sourceName: null });

    renderPage('1');

    expect(screen.queryByText('공고 출처')).not.toBeInTheDocument();
  });
});
