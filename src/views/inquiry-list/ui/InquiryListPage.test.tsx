import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InquiryListPage } from './InquiryListPage';

const { mockRefetch, mockReplace, mockUseMyInquiryListQuery } = vi.hoisted(() => ({
  mockRefetch: vi.fn(),
  mockReplace: vi.fn(),
  mockUseMyInquiryListQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock('@/entities/inquiry', async () => {
  const actual = await vi.importActual<typeof import('@/entities/inquiry')>('@/entities/inquiry');
  return {
    ...actual,
    useMyInquiryListQuery: mockUseMyInquiryListQuery,
    useCreateInquiryMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  };
});

vi.mock('@/widgets/site-header', () => ({
  SiteHeader: () => <header>GETI</header>,
}));

function queryResult(overrides: Record<string, unknown> = {}) {
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
    isPlaceholderData: false,
    isError: false,
    isSuccess: true,
    refetch: mockRefetch,
    ...overrides,
  };
}

beforeEach(() => {
  mockRefetch.mockReset();
  mockReplace.mockReset();
  mockUseMyInquiryListQuery.mockReset();
  mockUseMyInquiryListQuery.mockReturnValue(queryResult());
});

describe('InquiryListPage', () => {
  it('내 문의 목록 API 결과를 카드로 표시한다', () => {
    mockUseMyInquiryListQuery.mockReturnValue(
      queryResult({
        data: {
          content: [
            {
              inquiryId: 12,
              inquiryType: 'ERROR',
              title: '로그인 오류 문의',
              status: 'RECEIVED',
              createdAt: '2026-08-22T09:00:00',
              answeredAt: null,
            },
          ],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
          first: true,
          last: true,
        },
      }),
    );

    render(<InquiryListPage />);

    expect(screen.getByRole('link', { name: '로그인 오류 문의' })).toHaveAttribute(
      'href',
      '/inquiries/12',
    );
    expect(mockUseMyInquiryListQuery).toHaveBeenCalledWith({ page: 0, size: 20 });
  });

  it('URL의 화면 페이지 번호를 API의 0부터 시작하는 페이지로 변환한다', () => {
    mockUseMyInquiryListQuery.mockReturnValue(
      queryResult({
        data: {
          content: [
            {
              inquiryId: 21,
              inquiryType: 'ETC',
              title: '두 번째 페이지 문의',
              status: 'RECEIVED',
              createdAt: '2026-08-22T09:00:00',
              answeredAt: null,
            },
          ],
          page: 1,
          size: 20,
          totalElements: 21,
          totalPages: 2,
          first: false,
          last: true,
        },
      }),
    );

    render(<InquiryListPage page="2" />);

    expect(mockUseMyInquiryListQuery).toHaveBeenCalledWith({ page: 1, size: 20 });
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
  });

  it('전체 페이지보다 큰 페이지는 마지막 유효 페이지로 이동한다', () => {
    mockUseMyInquiryListQuery.mockReturnValue(
      queryResult({
        data: {
          content: [],
          page: 98,
          size: 20,
          totalElements: 21,
          totalPages: 2,
          first: false,
          last: true,
        },
      }),
    );

    render(<InquiryListPage page="99" />);

    expect(mockReplace).toHaveBeenCalledWith('/inquiries?page=2');
    expect(screen.getByRole('status', { name: '문의 목록을 불러오는 중' })).toBeInTheDocument();
  });

  it('두 번째 페이지에서 문의 등록에 성공하면 최신 목록인 첫 페이지로 이동한다', async () => {
    mockUseMyInquiryListQuery.mockReturnValue(
      queryResult({
        data: {
          content: [
            {
              inquiryId: 21,
              inquiryType: 'ETC',
              title: '두 번째 페이지 문의',
              status: 'RECEIVED',
              createdAt: '2026-08-22T09:00:00',
              answeredAt: null,
            },
          ],
          page: 1,
          size: 20,
          totalElements: 21,
          totalPages: 2,
          first: false,
          last: true,
        },
      }),
    );
    render(<InquiryListPage page="2" />);
    fireEvent.click(screen.getByRole('button', { name: '문의 등록' }));
    fireEvent.click(screen.getByLabelText('문의 유형'));
    fireEvent.click(screen.getByRole('option', { name: '오류' }));
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 문의' } });
    fireEvent.change(screen.getByLabelText('문의 내용'), { target: { value: '문의 내용' } });
    fireEvent.click(screen.getByRole('button', { name: '등록' }));

    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/inquiries');
    });
  });

  it('안전한 양의 정수가 아닌 페이지 값은 첫 페이지로 조회한다', () => {
    render(<InquiryListPage page="9007199254740992" />);

    expect(mockUseMyInquiryListQuery).toHaveBeenCalledWith({ page: 0, size: 20 });
  });

  it('목록 오류 상태에서 다시 시도하면 Query를 재요청한다', () => {
    mockUseMyInquiryListQuery.mockReturnValue(queryResult({ data: undefined, isError: true }));

    render(<InquiryListPage />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(mockRefetch).toHaveBeenCalledOnce();
  });

  it('조회 결과가 없으면 빈 목록 안내를 표시한다', () => {
    render(<InquiryListPage />);
    expect(screen.getByText('아직 등록된 문의가 없습니다.')).toBeInTheDocument();
  });

  it('기존 데이터의 백그라운드 갱신 중에는 목록을 유지한다', () => {
    mockUseMyInquiryListQuery.mockReturnValue(
      queryResult({
        data: {
          content: [
            {
              inquiryId: 12,
              inquiryType: 'ERROR',
              title: '갱신 중인 문의',
              status: 'RECEIVED',
              createdAt: '2026-08-22T09:00:00',
              answeredAt: null,
            },
          ],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
          first: true,
          last: true,
        },
        isFetching: true,
      }),
    );

    render(<InquiryListPage />);

    expect(screen.getByRole('link', { name: '갱신 중인 문의' })).toBeInTheDocument();
    expect(
      screen.queryByRole('status', { name: '문의 목록을 불러오는 중' }),
    ).not.toBeInTheDocument();
  });

  it('페이지 전환의 이전 데이터는 목록 대신 로딩 상태로 표시한다', () => {
    mockUseMyInquiryListQuery.mockReturnValue(
      queryResult({
        data: {
          content: [],
          page: 0,
          size: 20,
          totalElements: 21,
          totalPages: 2,
          first: true,
          last: false,
        },
        isFetching: true,
        isPlaceholderData: true,
      }),
    );

    render(<InquiryListPage page="2" />);

    expect(screen.getByRole('status', { name: '문의 목록을 불러오는 중' })).toBeInTheDocument();
  });
});
