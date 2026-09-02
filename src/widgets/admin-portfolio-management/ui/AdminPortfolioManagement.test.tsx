import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  PortfolioRequestListApiResponse,
  PortfolioRequestResponse,
  PortfolioSubmissionStatusListApiResponse,
} from '@/entities/portfolio-request';

import { AdminPortfolioManagement } from './AdminPortfolioManagement';

const mocks = vi.hoisted(() => ({
  createMutate: vi.fn(),
  detailRefetch: vi.fn(),
  downloadMutate: vi.fn(),
  listRefetch: vi.fn(),
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  scrollIntoView: vi.fn(),
  statusMutateAsync: vi.fn(),
  studentRefetch: vi.fn(),
  submissionsRefetch: vi.fn(),
  showToast: vi.fn(),
  updateMutate: vi.fn(),
  useAllAdminPortfolioRequestListQuery: vi.fn(),
  useAdminPortfolioSubmissionsQuery: vi.fn(),
  useCreateAdminPortfolioRequestMutation: vi.fn(),
  useDownloadAdminPortfolioSubmissionsMutation: vi.fn(),
  usePortfolioRequestDetailQuery: vi.fn(),
  useStudentListQuery: vi.fn(),
  useUpdateAdminPortfolioRequestMutation: vi.fn(),
  useUpdateAdminPortfolioRequestStatusMutation: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/portfolios',
  useRouter: () => ({ push: mocks.routerPush, replace: mocks.routerReplace }),
}));

vi.mock('@/entities/portfolio-request', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/portfolio-request')>();
  return {
    ...actual,
    useAllAdminPortfolioRequestListQuery: mocks.useAllAdminPortfolioRequestListQuery,
    useAdminPortfolioSubmissionsQuery: mocks.useAdminPortfolioSubmissionsQuery,
    useCreateAdminPortfolioRequestMutation: mocks.useCreateAdminPortfolioRequestMutation,
    useDownloadAdminPortfolioSubmissionsMutation:
      mocks.useDownloadAdminPortfolioSubmissionsMutation,
    usePortfolioRequestDetailQuery: mocks.usePortfolioRequestDetailQuery,
    useUpdateAdminPortfolioRequestMutation: mocks.useUpdateAdminPortfolioRequestMutation,
    useUpdateAdminPortfolioRequestStatusMutation:
      mocks.useUpdateAdminPortfolioRequestStatusMutation,
  };
});

vi.mock('@/entities/student', () => ({
  STUDENT_DEPARTMENT_LABELS: {
    AI: '인공지능과',
    SMART_IOT: '스마트IoT과',
    SW_DEVELOPMENT: '소프트웨어개발과',
  },
  useStudentListQuery: mocks.useStudentListQuery,
}));

vi.mock('@/shared/ui/toast', () => ({
  AppToaster: () => <div data-testid="app-toaster" />,
  showToast: mocks.showToast,
}));

const REQUEST_LIST_RESPONSE: PortfolioRequestListApiResponse = {
  content: [
    {
      dueAt: '2026-08-31T23:59:59',
      requestId: 1,
      status: 'PUBLISHED',
      submittedCount: 42,
      targetCount: 60,
      title: '상반기 포트폴리오',
    },
  ],
  first: true,
  last: true,
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
};

const REQUEST_RESPONSE: PortfolioRequestResponse = {
  createdAt: '2026-08-01T10:00:00',
  description: '제출 안내 내용',
  dueAt: '2026-08-31T23:59:59',
  requestId: 1,
  status: 'DRAFT',
  submittedCount: 0,
  targetCount: 1,
  title: '신규 포트폴리오 요청',
  updatedAt: '2026-08-01T10:00:00',
};

const SUBMISSION_LIST_RESPONSE: PortfolioSubmissionStatusListApiResponse = {
  content: [
    {
      cohort: 10,
      department: 'SW_DEVELOPMENT',
      materialType: 'URL',
      memberId: 11,
      status: 'SUBMITTED',
      studentName: '김민재',
      submitted: true,
      submittedAt: '2026-08-12T14:32:00',
    },
  ],
  first: true,
  last: true,
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
};

function renderAdminPortfolioManagement() {
  return render(<AdminPortfolioManagement />);
}

describe('AdminPortfolioManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/admin/portfolios');
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: mocks.scrollIntoView,
    });
    mocks.createMutate.mockImplementation((_variables, options) => {
      options?.onSuccess?.(REQUEST_RESPONSE);
    });
    mocks.statusMutateAsync.mockResolvedValue(REQUEST_RESPONSE);
    mocks.updateMutate.mockImplementation((_variables, options) => {
      options?.onSuccess?.(REQUEST_RESPONSE);
    });
    mocks.downloadMutate.mockImplementation((_variables, options) => {
      options?.onSuccess?.(new Blob(['portfolio']));
    });
    mocks.useAllAdminPortfolioRequestListQuery.mockReturnValue({
      data: REQUEST_LIST_RESPONSE.content,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mocks.listRefetch,
    });
    mocks.useAdminPortfolioSubmissionsQuery.mockReturnValue({
      data: SUBMISSION_LIST_RESPONSE,
      isError: false,
      isFetching: false,
      isLoading: false,
      isPlaceholderData: false,
      refetch: mocks.submissionsRefetch,
    });
    mocks.useCreateAdminPortfolioRequestMutation.mockReturnValue({
      isPending: false,
      mutate: mocks.createMutate,
    });
    mocks.useDownloadAdminPortfolioSubmissionsMutation.mockReturnValue({
      isPending: false,
      mutate: mocks.downloadMutate,
    });
    mocks.usePortfolioRequestDetailQuery.mockImplementation((requestId) => ({
      data: requestId === null ? undefined : REQUEST_RESPONSE,
      isError: false,
      isFetchedAfterMount: requestId !== null,
      isFetching: false,
      isLoading: false,
      refetch: mocks.detailRefetch,
    }));
    mocks.useStudentListQuery.mockReturnValue({
      data: {
        content: [
          {
            cohort: 10,
            department: 'SW_DEVELOPMENT',
            memberId: 11,
            name: '김민재',
            profileImageUrl: null,
            public: true,
          },
        ],
      },
      isError: false,
      isFetching: false,
      isPlaceholderData: false,
      refetch: mocks.studentRefetch,
    });
    mocks.useUpdateAdminPortfolioRequestMutation.mockReturnValue({
      isPending: false,
      mutate: mocks.updateMutate,
    });
    mocks.useUpdateAdminPortfolioRequestStatusMutation.mockReturnValue({
      isPending: false,
      mutateAsync: mocks.statusMutateAsync,
    });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:portfolio'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
  });

  it('포트폴리오 요청 목록을 API 응답으로 표시하고 제출 현황으로 이동한다', () => {
    renderAdminPortfolioManagement();

    expect(screen.getByText('상반기 포트폴리오')).toBeInTheDocument();
    expect(screen.getByText('진행 중')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '제출 현황' }));

    expect(mocks.routerPush).toHaveBeenCalledWith('/admin/portfolios?requestId=1', {
      scroll: false,
    });
    expect(screen.getByRole('heading', { name: '포트폴리오 제출 현황' })).toBeInTheDocument();
    expect(screen.getByText('상반기 포트폴리오 · 대상 60명')).toBeInTheDocument();
    expect(screen.getByText('김민재')).toBeInTheDocument();
  });

  it('목록 검색·상태·페이지를 URL에서 복원하고 변경 사항을 다시 반영한다', () => {
    const requests = Array.from({ length: 21 }, (_, index) => ({
      ...REQUEST_LIST_RESPONSE.content[0],
      requestId: index + 1,
      title: index === 20 ? '찾는 요청' : `일반 요청 ${index + 1}`,
    }));
    mocks.useAllAdminPortfolioRequestListQuery.mockReturnValue({
      data: requests,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mocks.listRefetch,
    });

    render(
      <AdminPortfolioManagement
        initialSearchParams={{ page: '2', query: '요청', status: 'PUBLISHED' }}
      />,
    );

    expect(mocks.useAllAdminPortfolioRequestListQuery).toHaveBeenLastCalledWith('PUBLISHED', 20);
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    fireEvent.change(screen.getByPlaceholderText('요청 제목으로 검색해 보세요.'), {
      target: { value: '찾는' },
    });

    expect(mocks.routerReplace).toHaveBeenLastCalledWith(
      '/admin/portfolios?query=%EC%B0%BE%EB%8A%94&status=PUBLISHED',
      { scroll: false },
    );
  });

  it('브라우저 뒤로가기로 상세 URL이 제거되면 요청 목록을 복원한다', () => {
    render(<AdminPortfolioManagement initialSearchParams={{ requestId: '1' }} />);
    expect(screen.getByRole('heading', { name: '포트폴리오 제출 현황' })).toBeInTheDocument();

    window.history.replaceState(null, '', '/admin/portfolios?query=상반기');
    fireEvent(window, new PopStateEvent('popstate'));

    expect(screen.getByText('상반기 포트폴리오')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('요청 제목으로 검색해 보세요.')).toHaveValue('상반기');
  });

  it('필수값을 입력하고 등록하면 수합 요청 등록 API를 호출한다', () => {
    renderAdminPortfolioManagement();

    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));
    fireEvent.change(screen.getByPlaceholderText('제목을 입력해 주세요.'), {
      target: { value: '신규 포트폴리오 요청' },
    });
    fireEvent.change(screen.getByPlaceholderText('학생에게 안내할 내용을 입력해 주세요.'), {
      target: { value: '제출 안내 내용' },
    });
    fireEvent.change(screen.getByPlaceholderText('YYYY.MM.DD'), {
      target: { value: '2026.08.31' },
    });

    const studentInput = screen.getByPlaceholderText('이름으로 학생을 선택해 주세요.');
    fireEvent.focus(studentInput);
    fireEvent.change(studentInput, { target: { value: '김민재' } });
    fireEvent.keyDown(studentInput, { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

    expect(mocks.createMutate).toHaveBeenCalledWith(
      {
        description: '제출 안내 내용',
        dueAt: '2026-08-31T23:59:59',
        targetStudentIds: [11],
        title: '신규 포트폴리오 요청',
      },
      expect.any(Object),
    );
  });

  it('설명 없이도 수합 요청을 등록할 수 있다', () => {
    renderAdminPortfolioManagement();

    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));
    fireEvent.change(screen.getByPlaceholderText('제목을 입력해 주세요.'), {
      target: { value: '설명 없는 요청' },
    });
    fireEvent.change(screen.getByPlaceholderText('YYYY.MM.DD'), {
      target: { value: '2026.08.31' },
    });
    const studentInput = screen.getByPlaceholderText('이름으로 학생을 선택해 주세요.');
    fireEvent.focus(studentInput);
    fireEvent.change(studentInput, { target: { value: '김민재' } });
    fireEvent.keyDown(studentInput, { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

    expect(mocks.createMutate).toHaveBeenCalledWith(
      {
        description: null,
        dueAt: '2026-08-31T23:59:59',
        targetStudentIds: [11],
        title: '설명 없는 요청',
      },
      expect.any(Object),
    );
  });

  it('종료일 형식이 올바르지 않으면 등록을 차단한다', () => {
    renderAdminPortfolioManagement();

    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));
    fireEvent.change(screen.getByPlaceholderText('제목을 입력해 주세요.'), {
      target: { value: '날짜 검증 요청' },
    });
    fireEvent.change(screen.getByPlaceholderText('학생에게 안내할 내용을 입력해 주세요.'), {
      target: { value: '제출 안내 내용' },
    });
    fireEvent.change(screen.getByPlaceholderText('YYYY.MM.DD'), {
      target: { value: '2026.02.31' },
    });
    fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

    expect(screen.getByText('올바른 종료일을 입력해 주세요.')).toBeInTheDocument();
    expect(mocks.createMutate).not.toHaveBeenCalled();
  });

  it('임시 저장 요청을 공개한다', () => {
    mocks.useAllAdminPortfolioRequestListQuery.mockReturnValue({
      data: [{ ...REQUEST_LIST_RESPONSE.content[0], status: 'DRAFT' }],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mocks.listRefetch,
    });

    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: '공개' }));

    expect(mocks.statusMutateAsync).toHaveBeenCalledWith({
      requestId: 1,
      status: 'PUBLISHED',
    });
  });

  it('동시에 상태를 변경해도 요청별 관리 동작을 독립적으로 비활성화한다', async () => {
    mocks.useAllAdminPortfolioRequestListQuery.mockReturnValue({
      data: [
        { ...REQUEST_LIST_RESPONSE.content[0], requestId: 1, status: 'DRAFT' },
        { ...REQUEST_LIST_RESPONSE.content[0], requestId: 2, status: 'DRAFT' },
      ],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mocks.listRefetch,
    });
    const resolvers = new Map<number, () => void>();
    mocks.statusMutateAsync.mockImplementation(
      ({ requestId }: { requestId: number }) =>
        new Promise<void>((resolve) => resolvers.set(requestId, resolve)),
    );

    renderAdminPortfolioManagement();

    const publishButtons = screen.getAllByRole('button', { name: '공개' });
    fireEvent.click(publishButtons[0]);
    fireEvent.click(publishButtons[1]);

    await waitFor(() => {
      expect(publishButtons[0]).toBeDisabled();
      expect(publishButtons[1]).toBeDisabled();
    });

    await act(async () => resolvers.get(2)?.());

    expect(publishButtons[0]).toBeDisabled();
    await waitFor(() => expect(publishButtons[1]).toBeEnabled());
    const firstRow = publishButtons[0].closest('tr');
    if (!firstRow) throw new Error('첫 번째 요청 행을 찾을 수 없습니다.');
    expect(within(firstRow).getByRole('button', { name: '제출 현황' })).toBeDisabled();
    expect(within(firstRow).getByRole('button', { name: '수정' })).toBeDisabled();
    expect(within(firstRow).getByRole('button', { name: '삭제' })).toBeDisabled();

    await act(async () => resolvers.get(1)?.());
    await waitFor(() => expect(publishButtons[0]).toBeEnabled());
  });

  it('진행 중 요청을 마감한다', () => {
    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: '마감' }));

    expect(mocks.statusMutateAsync).toHaveBeenCalledWith({ requestId: 1, status: 'CLOSED' });
  });

  it('종료된 요청에는 수정 동작을 표시하지 않는다', () => {
    mocks.useAllAdminPortfolioRequestListQuery.mockReturnValue({
      data: [{ ...REQUEST_LIST_RESPONSE.content[0], status: 'CLOSED' }],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mocks.listRefetch,
    });

    renderAdminPortfolioManagement();

    expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument();
  });

  it('수정 시 상세 API 응답을 폼에 채우고 기존 설명을 유지한다', () => {
    renderAdminPortfolioManagement();

    fireEvent.click(screen.getByRole('button', { name: '수정' }));

    expect(mocks.usePortfolioRequestDetailQuery).toHaveBeenLastCalledWith(1);
    expect(screen.getByPlaceholderText('학생에게 안내할 내용을 입력해 주세요.')).toHaveValue(
      '제출 안내 내용',
    );
    fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

    expect(mocks.updateMutate).toHaveBeenCalledWith(
      {
        request: {
          description: '제출 안내 내용',
          dueAt: '2026-08-31T23:59:59',
          targetStudentIds: undefined,
          title: '신규 포트폴리오 요청',
        },
        requestId: 1,
      },
      expect.any(Object),
    );
  });

  it('캐시된 상세 대신 최신 상세 조회가 끝난 뒤 수정 폼을 표시한다', () => {
    let isFresh = false;
    mocks.usePortfolioRequestDetailQuery.mockImplementation((requestId) => ({
      data:
        requestId === null
          ? undefined
          : { ...REQUEST_RESPONSE, description: isFresh ? '최신 설명' : '캐시된 설명' },
      isError: false,
      isFetchedAfterMount: requestId !== null && isFresh,
      isFetching: requestId !== null && !isFresh,
      isLoading: false,
      refetch: mocks.detailRefetch,
    }));
    const view = renderAdminPortfolioManagement();

    fireEvent.click(screen.getByRole('button', { name: '수정' }));

    expect(screen.getByText('수합 요청을 불러오는 중입니다.')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('캐시된 설명')).not.toBeInTheDocument();

    isFresh = true;
    view.rerender(<AdminPortfolioManagement />);

    expect(screen.getByDisplayValue('최신 설명')).toBeInTheDocument();
  });

  it('수정 시 설명을 비우면 빈 문자열로 변경 요청한다', () => {
    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    fireEvent.change(screen.getByPlaceholderText('학생에게 안내할 내용을 입력해 주세요.'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

    expect(mocks.updateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ request: expect.objectContaining({ description: '' }) }),
      expect.any(Object),
    );
  });

  it('대상 기수를 학생 검색 조건으로 안내하고 수정 화면에서는 숨긴다', () => {
    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));

    expect(screen.getByRole('combobox', { name: '학생 검색 기수' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    fireEvent.click(screen.getByRole('button', { name: '수정' }));

    expect(screen.queryByRole('combobox', { name: '학생 검색 기수' })).not.toBeInTheDocument();
    expect(
      screen.getByText('대상 1명 · 수정 화면에서는 대상 학생을 변경할 수 없습니다.'),
    ).toBeInTheDocument();
  });

  it('수정 상세 조회 실패 시 다시 시도할 수 있다', () => {
    mocks.usePortfolioRequestDetailQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isLoading: false,
      refetch: mocks.detailRefetch,
    });

    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getByText('수합 요청을 불러올 수 없습니다.')).toBeInTheDocument();
    expect(mocks.detailRefetch).toHaveBeenCalled();
  });

  it('제목 검색 시 첫 페이지로 돌아가 검색 결과를 표시한다', () => {
    mocks.useAllAdminPortfolioRequestListQuery.mockReturnValue({
      data: [
        { ...REQUEST_LIST_RESPONSE.content[0], title: '찾을 요청' },
        ...Array.from({ length: 20 }, (_, index) => ({
          ...REQUEST_LIST_RESPONSE.content[0],
          requestId: index + 2,
          title: `일반 요청 ${index + 1}`,
        })),
      ],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mocks.listRefetch,
    });

    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(screen.queryByText('찾을 요청')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('요청 제목으로 검색해 보세요.'), {
      target: { value: '찾을 요청' },
    });

    expect(screen.getByText('찾을 요청')).toBeInTheDocument();
  });

  it('마지막 페이지에서도 최대 5개의 페이지 번호를 표시한다', () => {
    mocks.useAllAdminPortfolioRequestListQuery.mockReturnValue({
      data: Array.from({ length: 121 }, (_, index) => ({
        ...REQUEST_LIST_RESPONSE.content[0],
        requestId: index + 1,
        title: `요청 ${index + 1}`,
      })),
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mocks.listRefetch,
    });

    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: '7' }));

    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7' })).toHaveAttribute('aria-current', 'page');
  });

  it('목록 데이터가 줄어 현재 페이지가 범위를 벗어나면 마지막 페이지로 이동한다', async () => {
    const allRequestItems = Array.from({ length: 41 }, (_, index) => ({
      ...REQUEST_LIST_RESPONSE.content[0],
      requestId: index + 1,
      title: `요청 ${index + 1}`,
    }));
    let requestItems = allRequestItems;
    mocks.useAllAdminPortfolioRequestListQuery.mockImplementation(() => ({
      data: requestItems,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mocks.listRefetch,
    }));
    const view = renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: '3' }));

    requestItems = requestItems.slice(0, 21);
    view.rerender(<AdminPortfolioManagement />);

    expect(screen.getByText('요청 21')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    await act(async () => new Promise((resolve) => window.setTimeout(resolve, 0)));
    requestItems = allRequestItems;
    view.rerender(<AdminPortfolioManagement />);

    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('요청 21')).toBeInTheDocument();
  });

  it('학생 검색 오류를 표시하고 다시 조회한다', () => {
    mocks.useStudentListQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isFetching: false,
      refetch: mocks.studentRefetch,
    });

    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));
    const studentInput = screen.getByPlaceholderText('이름으로 학생을 선택해 주세요.');
    fireEvent.focus(studentInput);
    fireEvent.change(studentInput, { target: { value: '김민재' } });
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getByText('학생을 검색할 수 없습니다.')).toBeInTheDocument();
    expect(screen.queryByRole('listbox', { name: '개별 학생 선택' })).not.toBeInTheDocument();
    expect(mocks.studentRefetch).toHaveBeenCalled();
  });

  it('이전 검색의 placeholder 학생은 새 검색 중 선택하지 않는다', () => {
    mocks.useStudentListQuery.mockReturnValue({
      data: {
        content: [
          {
            cohort: 10,
            department: 'SW_DEVELOPMENT',
            memberId: 11,
            name: '김민재',
            profileImageUrl: null,
            public: true,
          },
        ],
      },
      isError: false,
      isFetching: true,
      isPlaceholderData: true,
      refetch: mocks.studentRefetch,
    });
    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));
    const studentInput = screen.getByRole('combobox', { name: '개별 학생' });

    fireEvent.change(studentInput, { target: { value: '박지훈' } });
    fireEvent.keyDown(studentInput, { key: 'Enter' });

    expect(screen.queryByRole('option', { name: /김민재/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '김민재 선택 해제' })).not.toBeInTheDocument();
  });

  it('학생 검색 결과를 combobox 방향키와 Enter로 선택한다', () => {
    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));
    const studentInput = screen.getByRole('combobox', { name: '개별 학생' });

    fireEvent.focus(studentInput);
    fireEvent.change(studentInput, { target: { value: '김민재' } });

    expect(studentInput).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: '개별 학생 선택' })).toHaveClass(
      'max-h-72',
      'overflow-y-auto',
    );
    expect(screen.getByRole('option', { name: /김민재/ })).toHaveAttribute(
      'aria-selected',
      'false',
    );

    fireEvent.keyDown(studentInput, { key: 'ArrowDown' });

    expect(screen.getByRole('option', { name: /김민재/ })).toHaveAttribute('aria-selected', 'true');
    expect(studentInput).toHaveAttribute('aria-activedescendant');
    expect(mocks.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });

    fireEvent.keyDown(studentInput, { key: 'Enter' });

    expect(screen.getByRole('button', { name: '김민재 선택 해제' })).toBeInTheDocument();
  });

  it('학생 검색 다음 페이지 로딩 중 포커스를 유지하고 새 결과를 표시한다', () => {
    let isNextPageLoading = true;
    mocks.useStudentListQuery.mockImplementation((params) => {
      const firstPage = {
        content: [
          {
            cohort: 10,
            department: 'SW_DEVELOPMENT',
            memberId: 11,
            name: '김민재',
            profileImageUrl: null,
            public: true,
          },
        ],
        first: true,
        last: false,
        page: 0,
        size: 20,
        totalElements: 21,
        totalPages: 2,
      };

      if (params?.page === 1 && isNextPageLoading) {
        return {
          data: firstPage,
          isError: false,
          isFetching: true,
          isPlaceholderData: true,
          refetch: mocks.studentRefetch,
        };
      }
      if (params?.page === 1) {
        return {
          data: {
            ...firstPage,
            content: [
              {
                cohort: 10,
                department: 'AI',
                memberId: 21,
                name: '김서연',
                profileImageUrl: null,
                public: true,
              },
            ],
            first: false,
            last: true,
            page: 1,
          },
          isError: false,
          isFetching: false,
          isPlaceholderData: false,
          refetch: mocks.studentRefetch,
        };
      }

      return {
        data: firstPage,
        isError: false,
        isFetching: false,
        isPlaceholderData: false,
        refetch: mocks.studentRefetch,
      };
    });
    const view = renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));
    const studentInput = screen.getByRole('combobox', { name: '개별 학생' });
    fireEvent.focus(studentInput);
    fireEvent.change(studentInput, {
      target: { value: '김' },
    });

    expect(mocks.useStudentListQuery).toHaveBeenLastCalledWith({
      academicStatus: 'ENROLLED',
      cohort: undefined,
      name: '김',
      page: 0,
      size: 20,
    });

    fireEvent.click(screen.getByRole('button', { name: '다음 학생 검색 결과' }));

    expect(studentInput).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('학생 검색 중…');
    expect(screen.getByRole('button', { name: '다음 학생 검색 결과' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.queryByRole('listbox', { name: '개별 학생 선택' })).not.toBeInTheDocument();
    expect(mocks.useStudentListQuery).toHaveBeenLastCalledWith({
      academicStatus: 'ENROLLED',
      cohort: undefined,
      name: '김',
      page: 1,
      size: 20,
    });

    isNextPageLoading = false;
    view.rerender(<AdminPortfolioManagement />);

    expect(screen.getByRole('option', { name: /김서연/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /김민재/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '이전 학생 검색 결과' }));

    expect(studentInput).toHaveFocus();
    expect(screen.getByRole('option', { name: /김민재/ })).toBeInTheDocument();
  });

  it('학생 검색 다음 페이지가 실패해도 이전 페이지로 돌아갈 수 있다', () => {
    mocks.useStudentListQuery.mockImplementation((params) => {
      if (params?.page === 1) {
        return {
          data: undefined,
          isError: true,
          isFetching: false,
          isPlaceholderData: false,
          refetch: mocks.studentRefetch,
        };
      }

      return {
        data: {
          content: [],
          first: true,
          last: false,
          page: 0,
          size: 20,
          totalElements: 21,
          totalPages: 2,
        },
        isError: false,
        isFetching: false,
        isPlaceholderData: false,
        refetch: mocks.studentRefetch,
      };
    });
    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));
    const studentInput = screen.getByRole('combobox', { name: '개별 학생' });
    fireEvent.focus(studentInput);
    fireEvent.change(studentInput, { target: { value: '김' } });
    fireEvent.click(screen.getByRole('button', { name: '다음 학생 검색 결과' }));

    expect(screen.getByText('학생을 검색할 수 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이전 학생 검색 결과' })).toHaveAttribute(
      'aria-disabled',
      'false',
    );
    fireEvent.click(screen.getByRole('button', { name: '이전 학생 검색 결과' }));

    expect(studentInput).toHaveFocus();
    expect(mocks.useStudentListQuery).toHaveBeenLastCalledWith({
      academicStatus: 'ENROLLED',
      cohort: undefined,
      name: '김',
      page: 0,
      size: 20,
    });
  });

  it('제출 현황은 목록 Query가 갱신되면 최신 제출 요약을 표시한다', () => {
    let requestItems = REQUEST_LIST_RESPONSE.content;
    mocks.useAllAdminPortfolioRequestListQuery.mockImplementation(() => ({
      data: requestItems,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mocks.listRefetch,
    }));
    const view = renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: '제출 현황' }));

    expect(screen.getByText('42명')).toBeInTheDocument();

    requestItems = [{ ...REQUEST_LIST_RESPONSE.content[0], submittedCount: 43 }];
    view.rerender(<AdminPortfolioManagement />);

    expect(screen.getByText('43명')).toBeInTheDocument();
    expect(screen.queryByText('42명')).not.toBeInTheDocument();
  });

  it('삭제 확인 후 수합 요청 상태를 DELETED로 변경한다', () => {
    renderAdminPortfolioManagement();

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    const deleteDialog = screen.getByRole('dialog', { name: '수합 요청 삭제' });

    expect(
      within(deleteDialog).getByText('상반기 포트폴리오 수합 요청을 삭제하시겠습니까?'),
    ).toBeInTheDocument();

    fireEvent.click(within(deleteDialog).getByRole('button', { name: '삭제' }));

    expect(mocks.statusMutateAsync).toHaveBeenCalledWith({ requestId: 1, status: 'DELETED' });
  });

  it('네트워크 오류 상태에서 다시 시도할 수 있다', () => {
    mocks.useAllAdminPortfolioRequestListQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isFetching: false,
      isLoading: false,
      refetch: mocks.listRefetch,
    });

    renderAdminPortfolioManagement();

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getByText('포트폴리오 요청을 불러올 수 없습니다.')).toBeInTheDocument();
    expect(mocks.listRefetch).toHaveBeenCalled();
  });

  it('검색 결과 없음 상태를 표시한다', () => {
    mocks.useAllAdminPortfolioRequestListQuery.mockReturnValue({
      data: [],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mocks.listRefetch,
    });

    renderAdminPortfolioManagement();

    expect(screen.getByText('등록된 수합 요청이 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('새로운 수합 요청을 등록해 주세요.')).toBeInTheDocument();
  });

  it('제출 현황 필터 결과가 없으면 검색 조건을 확인하도록 안내한다', () => {
    mocks.useAdminPortfolioSubmissionsQuery.mockImplementation((_requestId, params) => ({
      data:
        params.submitted === false
          ? { ...SUBMISSION_LIST_RESPONSE, content: [], totalElements: 0, totalPages: 0 }
          : SUBMISSION_LIST_RESPONSE,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mocks.submissionsRefetch,
    }));
    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: '제출 현황' }));
    fireEvent.click(screen.getByRole('combobox', { name: '제출 상태' }));
    fireEvent.click(screen.getByRole('option', { name: '미제출' }));

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('검색어나 제출 상태를 확인해 주세요.')).toBeInTheDocument();
  });

  it('로딩 상태를 표시한다', () => {
    mocks.useAllAdminPortfolioRequestListQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: false,
      isLoading: true,
      refetch: mocks.listRefetch,
    });

    renderAdminPortfolioManagement();

    expect(screen.getByText('정보를 불러오는 중입니다.')).toBeInTheDocument();
    expect(screen.getByText('잠시만 기다려 주세요.')).toBeInTheDocument();
  });

  it('제출 현황의 일괄 다운로드 버튼에는 아이콘을 표시하지 않는다', () => {
    renderAdminPortfolioManagement();

    fireEvent.click(screen.getByRole('button', { name: '제출 현황' }));
    const downloadButton = screen.getByRole('button', { name: '자료 일괄 다운로드' });

    expect(downloadButton.querySelector('svg')).toBeNull();
  });

  it('ZIP 파일명을 정리하고 다음 태스크에서 객체 URL을 해제한다', async () => {
    vi.useFakeTimers();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    mocks.useAllAdminPortfolioRequestListQuery.mockReturnValue({
      data: [{ ...REQUEST_LIST_RESPONSE.content[0], title: '상반기/포트폴리오:최종.' }],
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: mocks.listRefetch,
    });

    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: '제출 현황' }));
    fireEvent.click(screen.getByRole('button', { name: '자료 일괄 다운로드' }));

    const link = click.mock.instances[0] as HTMLAnchorElement;
    expect(link.download).toBe('상반기_포트폴리오_최종-포트폴리오.zip');
    expect(click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    await vi.runAllTimersAsync();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:portfolio');

    vi.useRealTimers();
  });

  it('제출 현황 화면에서도 토스트 컨테이너를 렌더링한다', () => {
    renderAdminPortfolioManagement();

    fireEvent.click(screen.getByRole('button', { name: '제출 현황' }));

    expect(screen.getByTestId('app-toaster')).toBeInTheDocument();
  });

  it('제출 현황을 이름으로 검색하고 입력을 지우면 검색을 초기화한다', () => {
    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: '제출 현황' }));
    const searchInput = screen.getByPlaceholderText('이름으로 검색해 보세요.');

    fireEvent.change(searchInput, { target: { value: '김민재' } });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    expect(mocks.useAdminPortfolioSubmissionsQuery).toHaveBeenLastCalledWith(1, {
      name: '김민재',
      page: 0,
      size: 20,
      submitted: undefined,
    });

    fireEvent.change(searchInput, { target: { value: '' } });

    expect(mocks.useAdminPortfolioSubmissionsQuery).toHaveBeenLastCalledWith(1, {
      name: undefined,
      page: 0,
      size: 20,
      submitted: undefined,
    });
  });

  it('제출 상태 변경 중에는 이전 제출 목록 대신 로딩 상태를 표시한다', () => {
    mocks.useAdminPortfolioSubmissionsQuery.mockImplementation((_requestId, params) =>
      params.submitted === true
        ? {
            data: SUBMISSION_LIST_RESPONSE,
            isError: false,
            isFetching: true,
            isLoading: false,
            isPlaceholderData: true,
            refetch: mocks.submissionsRefetch,
          }
        : {
            data: SUBMISSION_LIST_RESPONSE,
            isError: false,
            isFetching: false,
            isLoading: false,
            isPlaceholderData: false,
            refetch: mocks.submissionsRefetch,
          },
    );

    renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: '제출 현황' }));
    fireEvent.click(screen.getByRole('combobox', { name: '제출 상태' }));
    fireEvent.click(screen.getByRole('option', { name: '제출' }));

    expect(screen.getByText('정보를 불러오는 중입니다.')).toBeInTheDocument();
    expect(screen.queryByText('김민재')).not.toBeInTheDocument();
  });

  it('제출 결과가 줄어 현재 페이지가 범위를 벗어나면 마지막 페이지를 다시 조회한다', async () => {
    let hasShrunk = false;
    mocks.useAdminPortfolioSubmissionsQuery.mockImplementation((_requestId, params) => {
      if (params.page === 1) {
        return {
          data: {
            ...SUBMISSION_LIST_RESPONSE,
            content: hasShrunk ? [] : SUBMISSION_LIST_RESPONSE.content,
            first: false,
            last: true,
            page: 1,
            totalElements: hasShrunk ? 20 : 21,
            totalPages: hasShrunk ? 1 : 2,
          },
          isError: false,
          isFetching: false,
          isLoading: false,
          refetch: mocks.submissionsRefetch,
        };
      }

      return {
        data: { ...SUBMISSION_LIST_RESPONSE, last: false, totalElements: 21, totalPages: 2 },
        isError: false,
        isFetching: false,
        isLoading: false,
        refetch: mocks.submissionsRefetch,
      };
    });
    const view = renderAdminPortfolioManagement();
    fireEvent.click(screen.getByRole('button', { name: '제출 현황' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));

    hasShrunk = true;
    view.rerender(<AdminPortfolioManagement />);

    expect(screen.getByText('정보를 불러오는 중입니다.')).toBeInTheDocument();
    await waitFor(() =>
      expect(mocks.useAdminPortfolioSubmissionsQuery).toHaveBeenLastCalledWith(1, {
        name: undefined,
        page: 0,
        size: 20,
        submitted: undefined,
      }),
    );
    expect(screen.getByText('김민재')).toBeInTheDocument();
  });

  it('요청 목록은 피그마 너비를 유지하고 좁은 화면에서 가로 스크롤을 제공한다', () => {
    renderAdminPortfolioManagement();

    const listRegion = screen.getByRole('region', { name: '포트폴리오 요청 목록' });

    expect(listRegion).toHaveClass('overflow-x-auto');
    expect(within(listRegion).getByRole('table')).toHaveClass('w-[1620px]', 'min-w-[1620px]');
  });
});
