import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { JobDetail } from '@/entities/job';

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

const { mockUseJobDetailQuery } = vi.hoisted(() => ({
  mockUseJobDetailQuery: vi.fn(),
}));

vi.mock('@/entities/job', async () => {
  const actual = await vi.importActual<typeof import('@/entities/job')>('@/entities/job');
  return { ...actual, useJobDetailQuery: mockUseJobDetailQuery };
});

const BASE_JOB: JobDetail = {
  jobId: 1,
  title: '백엔드 개발 인턴',
  postingType: 'GENERAL',
  applicationMethod: 'EXTERNAL',
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
});
