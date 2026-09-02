import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminJobDetail } from '@/entities/job';
import { ApiError } from '@/shared/api';

import { AdminJobEditPage } from './AdminJobEditPage';

const {
  mockUseAdminJobDetailQuery,
  mockUseCompanyOptionsQuery,
  mockUseUpdateAdminJobMutation,
  mockMutate,
  mockPush,
  mockRefetch,
} = vi.hoisted(() => ({
  mockUseAdminJobDetailQuery: vi.fn(),
  mockUseCompanyOptionsQuery: vi.fn(),
  mockUseUpdateAdminJobMutation: vi.fn(),
  mockMutate: vi.fn(),
  mockPush: vi.fn(),
  mockRefetch: vi.fn(),
}));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

vi.mock('@/entities/company', async () => {
  const actual = await vi.importActual<typeof import('@/entities/company')>('@/entities/company');
  return { ...actual, useCompanyOptionsQuery: mockUseCompanyOptionsQuery };
});

vi.mock('@/entities/job', async () => {
  const actual = await vi.importActual<typeof import('@/entities/job')>('@/entities/job');
  return {
    ...actual,
    useAdminJobDetailQuery: mockUseAdminJobDetailQuery,
    useUpdateAdminJobMutation: mockUseUpdateAdminJobMutation,
  };
});

function detail(overrides: Partial<AdminJobDetail> = {}): AdminJobDetail {
  return {
    jobId: 5,
    title: '백엔드 개발자 채용',
    postingType: 'MOU',
    applicationMethod: 'EXTERNAL',
    status: 'PUBLISHED',
    company: { companyId: 7, name: '네오스튜디오', logoUrl: null },
    content: '본문',
    externalUrl: 'https://example.com/apply',
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
    updatedAt: '2026-08-01T08:58:00',
    aiAnalysis: null,
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

beforeEach(() => {
  mockUseAdminJobDetailQuery.mockReturnValue({
    data: detail(),
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  });
  mockUseCompanyOptionsQuery.mockReturnValue({
    data: [{ companyId: 7, name: '네오스튜디오' }],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  mockUseUpdateAdminJobMutation.mockReturnValue({ mutate: mockMutate, isPending: false });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AdminJobEditPage', () => {
  it('jobId가 정수가 아니면 조회하지 않고 오류 상태를 보여준다', () => {
    render(<AdminJobEditPage jobId="abc" />);

    expect(mockUseAdminJobDetailQuery).toHaveBeenCalledWith(null);
    expect(screen.getByText('공고 정보를 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('조회 성공 시 기존 값이 채워진 폼을 보여준다', () => {
    render(<AdminJobEditPage jobId="5" />);

    expect(screen.getByRole('heading', { name: '공고 수정', level: 1 })).toBeInTheDocument();
    expect(screen.getByDisplayValue('백엔드 개발자 채용')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '수정하기' })).toBeEnabled();
  });

  it('수정하기를 누르면 jobId와 부분 payload로 뮤테이션을 호출하고 성공 시 상세로 이동한다', () => {
    render(<AdminJobEditPage jobId="5" />);

    fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

    expect(mockMutate).toHaveBeenCalledWith(
      { jobId: 5, payload: expect.objectContaining({ title: '백엔드 개발자 채용' }) },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    const { onSuccess } = mockMutate.mock.calls[0][1];
    onSuccess();
    expect(mockPush).toHaveBeenCalledWith('/admin/jobs/5');
  });

  it('수정 실패 시 서버 오류 메시지를 보여준다', () => {
    render(<AdminJobEditPage jobId="5" />);
    fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

    const { onError } = mockMutate.mock.calls[0][1];
    act(() => onError(new ApiError('게시 필수값을 잃었습니다.', 400)));

    expect(screen.getByRole('alert')).toHaveTextContent('게시 필수값을 잃었습니다.');
  });
});
