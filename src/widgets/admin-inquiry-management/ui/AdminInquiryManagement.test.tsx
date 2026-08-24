import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminInquiryManagement } from './AdminInquiryManagement';

const {
  mockAnswerMutate,
  mockDetailQuery,
  mockDownloadMutate,
  mockListQuery,
  mockRouterReplace,
  mockStatusMutate,
} = vi.hoisted(() => ({
  mockAnswerMutate: vi.fn(),
  mockDetailQuery: vi.fn(),
  mockDownloadMutate: vi.fn(),
  mockListQuery: vi.fn(),
  mockRouterReplace: vi.fn(),
  mockStatusMutate: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/inquiries',
  useRouter: () => ({ replace: mockRouterReplace }),
}));

vi.mock('@/shared/ui/toast', () => ({
  AppToaster: () => null,
  showToast: vi.fn(),
}));

vi.mock('@/entities/inquiry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/inquiry')>();
  return {
    ...actual,
    useAdminInquiryListQuery: mockListQuery,
    useCreateAdminInquiryAnswerMutation: () => ({
      isPending: false,
      mutate: mockAnswerMutate,
    }),
    useDownloadInquiryFileMutation: () => ({
      isPending: false,
      mutate: mockDownloadMutate,
      variables: undefined,
    }),
    useInquiryDetailQuery: mockDetailQuery,
    useUpdateAdminInquiryStatusMutation: () => ({
      isPending: false,
      mutate: mockStatusMutate,
    }),
  };
});

const LIST_ITEM = {
  inquiryId: 1,
  inquiryType: 'ERROR' as const,
  title: 'AI 추천 결과가 보이지 않습니다.',
  status: 'RECEIVED' as const,
  author: { memberId: 11, name: '김민재' },
  assignee: null,
  createdAt: '2026-08-01T10:24:00',
  answeredAt: null,
};

const DETAIL = {
  inquiryId: 1,
  inquiryType: 'ERROR' as const,
  title: LIST_ITEM.title,
  content: '맞춤 추천 공고가 표시되지 않습니다.',
  status: 'RECEIVED' as const,
  author: {
    memberId: 11,
    name: '김민재',
    profileImageUrl: null,
    cohort: 10,
    department: 'SMART_IOT',
    isPublic: true,
  },
  files: [],
  assignee: null,
  answers: [],
  createdAt: '2026-08-01T10:24:00',
  updatedAt: '2026-08-01T10:24:00',
};

function successListQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      content: [LIST_ITEM],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    },
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mockAnswerMutate.mockReset();
  mockDetailQuery.mockReset();
  mockDownloadMutate.mockReset();
  mockListQuery.mockReset();
  mockRouterReplace.mockReset();
  mockStatusMutate.mockReset();

  mockListQuery.mockReturnValue(successListQuery());
  mockDetailQuery.mockImplementation((inquiryId: number | null) => ({
    data: inquiryId === null ? undefined : DETAIL,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }));
  mockAnswerMutate.mockImplementation((_variables, options) => options?.onSuccess?.());
  mockStatusMutate.mockImplementation((_variables, options) => options?.onSuccess?.());
});

describe('AdminInquiryManagement', () => {
  it('실제 목록 모델을 표시하고 상세에서 답변 등록 Mutation을 호출한다', async () => {
    const user = userEvent.setup();
    render(<AdminInquiryManagement />);

    expect(screen.getByText('총 1개 문의')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '문의 목록' })).toHaveClass('overflow-x-auto');
    expect(within(screen.getByRole('table')).getByText('오류')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '상세보기' }));

    const dialog = screen.getByRole('dialog', { name: '문의 상세' });
    expect(within(dialog).getByText('2026.08.01 10:24')).toBeInTheDocument();
    expect(within(dialog).getByText('10기 · 스마트IoT과')).toBeInTheDocument();

    await user.type(within(dialog).getByRole('textbox', { name: '답변' }), '확인했습니다.');
    await user.click(within(dialog).getByRole('button', { name: '답변 완료' }));

    expect(mockAnswerMutate).toHaveBeenCalledWith(
      { inquiryId: 1, content: '확인했습니다.' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
    expect(screen.queryByRole('dialog', { name: '문의 상세' })).not.toBeInTheDocument();
  });

  it('현재 상태에서 서버가 허용하는 다음 상태만 보여주고 상태 변경 Mutation을 호출한다', async () => {
    const user = userEvent.setup();
    render(<AdminInquiryManagement />);

    await user.click(screen.getByRole('button', { name: '상세보기' }));
    const dialog = screen.getByRole('dialog', { name: '문의 상세' });
    await user.click(within(dialog).getByRole('combobox', { name: '문의 상태' }));

    const listbox = within(dialog).getByRole('listbox', { name: '문의 상태' });
    expect(within(listbox).getAllByRole('option')).toHaveLength(2);
    expect(within(listbox).queryByRole('option', { name: '답변 완료' })).not.toBeInTheDocument();

    await user.click(within(listbox).getByRole('option', { name: '처리 중' }));
    expect(mockStatusMutate).toHaveBeenCalledWith(
      { inquiryId: 1, status: 'IN_PROGRESS' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('문의 내용 다음에 문의·답변 첨부파일을 표시하고 인증 다운로드 Mutation을 호출한다', async () => {
    const user = userEvent.setup();
    const detailWithFiles = {
      ...DETAIL,
      status: 'ANSWERED' as const,
      files: [
        {
          fileId: 3,
          originalName: '문의.png',
          contentType: 'image/png',
          size: 1024,
          downloadUrl: '/api/v1/files/3/download',
        },
      ],
      answers: [
        {
          answerId: 7,
          inquiryId: 1,
          authorMemberId: 9,
          content: '기존 답변입니다.',
          files: [
            {
              fileId: 4,
              originalName: '답변.pdf',
              contentType: 'application/pdf',
              size: 2048,
              downloadUrl: '/api/v1/files/4/download',
            },
          ],
          createdAt: '2026-08-01T11:24:00',
        },
      ],
    };
    mockDetailQuery.mockImplementation((inquiryId: number | null) => ({
      data: inquiryId === null ? undefined : detailWithFiles,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    }));

    render(<AdminInquiryManagement />);
    await user.click(screen.getByRole('button', { name: '상세보기' }));

    const inquiryContent = screen.getByText(DETAIL.content);
    const registeredAnswer = screen.getByText('기존 답변입니다.');
    expect(
      inquiryContent.compareDocumentPosition(registeredAnswer) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: '문의.png' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '답변.pdf' }));
    expect(mockDownloadMutate).toHaveBeenCalledWith(
      { fileId: 4 },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('검색·유형·상태 조건을 서버 목록 Query에 전달하고 URL에 유지한다', async () => {
    const user = userEvent.setup();
    render(<AdminInquiryManagement />);

    await user.type(screen.getByRole('searchbox', { name: '문의 검색' }), '로그인');
    await user.click(screen.getByRole('combobox', { name: '문의 유형' }));
    await user.click(screen.getByRole('option', { name: '오류' }));
    await user.click(screen.getByRole('combobox', { name: '문의 상태' }));
    await user.click(screen.getByRole('option', { name: '답변 대기' }));

    await waitFor(() => {
      expect(mockListQuery).toHaveBeenLastCalledWith({
        inquiryType: 'ERROR',
        page: 0,
        query: '로그인',
        size: 20,
        status: 'RECEIVED',
      });
    });
    expect(mockRouterReplace).toHaveBeenLastCalledWith(
      '/admin/inquiries?q=%EB%A1%9C%EA%B7%B8%EC%9D%B8&type=ERROR&status=RECEIVED',
      { scroll: false },
    );
  });

  it('목록 오류 상태에서 실제 Query를 다시 요청한다', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockListQuery.mockReturnValue(successListQuery({ data: undefined, isError: true, refetch }));

    render(<AdminInquiryManagement />);
    expect(screen.getByRole('alert')).toHaveTextContent('문의를 불러올 수 없습니다.');

    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('필터 결과가 비었을 때 필터 빈 상태를 표시한다', () => {
    mockListQuery.mockReturnValue(
      successListQuery({
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

    render(<AdminInquiryManagement initialSearchParams={{ type: 'ERROR' }} />);
    expect(screen.getByText('조건에 맞는 문의가 없습니다.')).toBeInTheDocument();
  });

  it('요청한 페이지가 범위를 벗어나면 마지막 유효 페이지 URL로 복구한다', async () => {
    mockListQuery.mockImplementation(({ page }: { page: number }) =>
      successListQuery({
        data: {
          content: page === 4 ? [] : [LIST_ITEM],
          page,
          size: 20,
          totalElements: 21,
          totalPages: 2,
          first: page === 0,
          last: page === 1,
        },
      }),
    );

    render(<AdminInquiryManagement initialSearchParams={{ page: '5' }} />);

    await waitFor(() => {
      expect(mockListQuery).toHaveBeenLastCalledWith({
        inquiryType: undefined,
        page: 1,
        query: undefined,
        size: 20,
        status: undefined,
      });
      expect(mockRouterReplace).toHaveBeenLastCalledWith('/admin/inquiries?page=2', {
        scroll: false,
      });
    });
    expect(
      screen.queryByRole('status', { name: '문의 목록을 불러오는 중' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('총 21개 문의')).toBeInTheDocument();
  });

  it('상세 조회 실패 시 상세 패널 안에서 재시도할 수 있다', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockDetailQuery.mockImplementation((inquiryId: number | null) => ({
      data: undefined,
      isError: inquiryId !== null,
      isLoading: false,
      refetch,
    }));

    render(<AdminInquiryManagement />);
    await user.click(screen.getByRole('button', { name: '상세보기' }));

    expect(screen.getByRole('dialog', { name: '문의 상세 오류' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalledOnce();
  });
});
