import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';

import { InquiryDetailPage } from './InquiryDetailPage';

const { mockRefetch, mockUseInquiryDetailQuery } = vi.hoisted(() => ({
  mockRefetch: vi.fn(),
  mockUseInquiryDetailQuery: vi.fn(),
}));

vi.mock('@/entities/inquiry', async () => {
  const actual = await vi.importActual<typeof import('@/entities/inquiry')>('@/entities/inquiry');
  return {
    ...actual,
    useInquiryDetailQuery: mockUseInquiryDetailQuery,
  };
});

vi.mock('@/widgets/site-header', () => ({
  SiteHeader: () => <header>GETI</header>,
}));

function queryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
    ...overrides,
  };
}

beforeEach(() => {
  mockRefetch.mockReset();
  mockUseInquiryDetailQuery.mockReset();
  mockUseInquiryDetailQuery.mockReturnValue(queryResult());
});

describe('InquiryDetailPage', () => {
  it('문의 상세와 모든 답변을 표시한다', () => {
    mockUseInquiryDetailQuery.mockReturnValue(
      queryResult({
        data: {
          inquiryId: 3,
          inquiryType: 'INCONVENIENCE',
          title: '사용 불편 문의',
          content: '화면 사용이 불편합니다.',
          status: 'ANSWERED',
          author: {
            memberId: 1,
            name: '테스트 학생',
            profileImageUrl: null,
            cohort: 10,
            department: 'SOFTWARE',
            isPublic: true,
          },
          files: [],
          assignee: null,
          answers: [
            {
              answerId: 5,
              inquiryId: 3,
              authorMemberId: 2,
              content: '첫 번째 답변',
              files: [],
              createdAt: '2026-08-22T10:00:00',
            },
            {
              answerId: 6,
              inquiryId: 3,
              authorMemberId: 2,
              content: '두 번째 답변',
              files: [],
              createdAt: '2026-08-22T11:00:00',
            },
          ],
          createdAt: '2026-08-22T09:00:00',
          updatedAt: '2026-08-22T11:00:00',
        },
      }),
    );

    render(<InquiryDetailPage inquiryId="3" />);

    expect(screen.getByText('사용 불편 문의')).toBeInTheDocument();
    expect(screen.getByText('첫 번째 답변')).toBeInTheDocument();
    expect(screen.getByText('두 번째 답변')).toBeInTheDocument();
  });

  it('목록에서 전달한 페이지로 돌아가는 링크를 표시한다', () => {
    render(<InquiryDetailPage inquiryId="3" returnPage="2" />);

    expect(screen.getByRole('link', { name: '문의 목록' })).toHaveAttribute(
      'href',
      '/inquiries?page=2',
    );
  });

  it('403과 404 오류는 접근할 수 없는 문의 안내로 처리한다', () => {
    mockUseInquiryDetailQuery.mockReturnValue(
      queryResult({
        error: new ApiError('접근 권한 없음', 403, 'INQUIRY_ACCESS_DENIED'),
        isError: true,
      }),
    );

    render(<InquiryDetailPage inquiryId="3" />);

    expect(screen.getByText('문의를 찾을 수 없습니다.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument();
  });

  it('서버 오류 상태에서 다시 시도하면 Query를 재요청한다', () => {
    mockUseInquiryDetailQuery.mockReturnValue(
      queryResult({ error: new ApiError('서버 오류', 500), isError: true }),
    );

    render(<InquiryDetailPage inquiryId="3" />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(mockRefetch).toHaveBeenCalledOnce();
  });

  it('유효하지 않은 문의 ID는 API를 호출하지 않고 대상 없음으로 처리한다', () => {
    render(<InquiryDetailPage inquiryId="invalid" />);

    expect(mockUseInquiryDetailQuery).toHaveBeenCalledWith(null);
    expect(screen.getByText('문의를 찾을 수 없습니다.')).toBeInTheDocument();
  });
});
