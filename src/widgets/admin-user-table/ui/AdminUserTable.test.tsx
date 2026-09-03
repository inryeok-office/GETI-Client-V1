import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';
import type { AdminMemberDetail, AdminMemberSummary } from '@/entities/member';

import { AdminUserTable } from './AdminUserTable';

const { mockUseListQuery, mockUseDetailQuery, mockUseMyProfileQuery, mockReplace, mockRefetch } =
  vi.hoisted(() => ({
    mockUseListQuery: vi.fn(),
    mockUseDetailQuery: vi.fn(),
    mockUseMyProfileQuery: vi.fn(),
    mockReplace: vi.fn(),
    mockRefetch: vi.fn(),
  }));

/** 현재 URL 쿼리스트링. `mockReplace`가 갱신하고 `useSearchParams` 목이 읽는다. */
let currentSearch = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/admin/users',
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

vi.mock('@/entities/member', async () => {
  const actual = await vi.importActual<typeof import('@/entities/member')>('@/entities/member');
  return {
    ...actual,
    useAdminMemberListQuery: mockUseListQuery,
    useAdminMemberDetailQuery: mockUseDetailQuery,
    useMyProfileQuery: mockUseMyProfileQuery,
  };
});

function summary(overrides: Partial<AdminMemberSummary> = {}): AdminMemberSummary {
  return {
    memberId: 1,
    email: 'minjae@gsm.hs.kr',
    name: '김민재',
    status: 'ACTIVE',
    roles: ['STUDENT'],
    oauthProvider: 'DG',
    cohort: 5,
    department: 'SW_DEVELOPMENT',
    createdAt: '2026-03-02T09:00:00',
    ...overrides,
  };
}

function detail(overrides: Partial<AdminMemberDetail> = {}): AdminMemberDetail {
  return {
    memberId: 1,
    email: 'minjae@gsm.hs.kr',
    name: '김민재',
    status: 'ACTIVE',
    roles: ['STUDENT'],
    oauthProvider: 'DG',
    academicStatus: 'ENROLLED',
    cohort: 5,
    grade: 3,
    department: 'SW_DEVELOPMENT',
    phoneNumber: '010-1234-5678',
    githubUrl: 'https://github.com/minjae',
    rejectionReason: null,
    approvedAt: null,
    createdAt: '2026-03-02T09:00:00',
    updatedAt: '2026-08-01T10:00:00',
    withdrawnAt: null,
    ...overrides,
  };
}

function listResult(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      content: [summary()],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: mockRefetch,
    ...overrides,
  };
}

function detailResult(overrides: Record<string, unknown> = {}) {
  return { data: undefined, isLoading: false, isError: false, refetch: mockRefetch, ...overrides };
}

/** `mockReplace`에 마지막으로 넘어온 URL의 쿼리스트링. */
function lastReplacedQuery(): URLSearchParams {
  const url = mockReplace.mock.calls.at(-1)?.[0] as string | undefined;
  return new URLSearchParams(url?.split('?')[1] ?? '');
}

/** 초기 URL을 세팅한다 — `useSearchParams` 목과 `window.location` 둘 다 맞춘다. */
function setUrl(queryString: string) {
  currentSearch = queryString;
  window.history.replaceState({}, '', queryString ? `/admin/users?${queryString}` : '/admin/users');
}

beforeEach(() => {
  currentSearch = '';
  window.history.replaceState({}, '', '/admin/users');
  mockReplace.mockImplementation((url: string) => {
    currentSearch = url.split('?')[1] ?? '';
    // 실제 Next router.replace처럼 window.location도 갱신한다(디바운스가 이 값을 읽는다).
    window.history.replaceState({}, '', url);
  });
  mockUseListQuery.mockReturnValue(listResult());
  mockUseDetailQuery.mockReturnValue(detailResult());
  mockUseMyProfileQuery.mockReturnValue({ data: { memberId: 99 } });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('AdminUserTable', () => {
  it('회원 목록과 검색·필터를 표시한다', () => {
    render(<AdminUserTable />);

    expect(screen.getByRole('heading', { name: '사용자 관리', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('총 1명')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('이름으로 검색해 보세요.')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '역할 필터' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('기수')).toBeInTheDocument();
    expect(screen.getByText('김민재')).toBeInTheDocument();
    expect(screen.getByText('5기 · 소프트웨어개발과')).toBeInTheDocument();

    const list = screen.getByRole('region', { name: '사용자 목록' });
    expect(within(list).getByRole('table')).toHaveClass('w-[1620px]', 'min-w-[1620px]');
  });

  it('URL 쿼리를 읽어 그 값으로 목록을 조회한다', () => {
    setUrl('q=보검&role=TEACHER&status=SUSPENDED&cohort=4&page=2');

    render(<AdminUserTable />);

    expect(mockUseListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        name: '보검',
        role: 'TEACHER',
        status: 'SUSPENDED',
        cohort: 4,
        page: 1,
      }),
    );
  });

  it('검색어는 300ms 디바운스 후 q로 URL에 반영하고 page를 지운다', () => {
    vi.useFakeTimers();
    setUrl('page=2');
    mockUseListQuery.mockReturnValue(
      listResult({ data: { ...listResult().data, totalPages: 5, last: false } }),
    );
    render(<AdminUserTable />);

    fireEvent.change(screen.getByPlaceholderText('이름으로 검색해 보세요.'), {
      target: { value: '민재' },
    });
    expect(mockReplace).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));

    const query = lastReplacedQuery();
    expect(query.get('q')).toBe('민재');
    expect(query.get('page')).toBeNull();
  });

  it('역할 필터를 바꾸면 즉시 role을 URL에 반영하고 page를 지운다', () => {
    setUrl('page=2');
    render(<AdminUserTable />);

    fireEvent.click(screen.getByRole('combobox', { name: '역할 필터' }));
    fireEvent.click(screen.getByRole('option', { name: '개발자' }));

    const query = lastReplacedQuery();
    expect(query.get('role')).toBe('DEVELOPER');
    expect(query.get('page')).toBeNull();
  });

  it('검색 입력 직후 필터를 바꿔도, 늦게 실행되는 디바운스가 그 필터를 덮어쓰지 않는다', () => {
    vi.useFakeTimers();
    const { rerender } = render(<AdminUserTable />);

    // 검색어 입력(디바운스 대기 중) → 즉시 역할 필터 변경
    fireEvent.change(screen.getByPlaceholderText('이름으로 검색해 보세요.'), {
      target: { value: '민재' },
    });
    fireEvent.click(screen.getByRole('combobox', { name: '역할 필터' }));
    fireEvent.click(screen.getByRole('option', { name: '개발자' }));
    rerender(<AdminUserTable />); // router.replace(role) 반영

    // 이제 디바운스가 뒤늦게 실행돼도 role을 잃으면 안 된다.
    act(() => vi.advanceTimersByTime(300));

    const query = lastReplacedQuery();
    expect(query.get('q')).toBe('민재');
    expect(query.get('role')).toBe('DEVELOPER');
  });

  it('기수 필터에 값을 넣으면 cohort를 URL에 반영한다', () => {
    render(<AdminUserTable />);

    fireEvent.change(screen.getByPlaceholderText('기수'), { target: { value: '7' } });

    expect(lastReplacedQuery().get('cohort')).toBe('7');
  });

  it('페이지 이동은 page 파라미터로 URL에 반영한다', () => {
    mockUseListQuery.mockReturnValue(
      listResult({ data: { ...listResult().data, totalPages: 3, last: false } }),
    );
    render(<AdminUserTable />);

    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    expect(lastReplacedQuery().get('page')).toBe('2');
  });

  it('URL page가 totalPages를 벗어나면 마지막 유효 페이지로 보정한다', () => {
    setUrl('page=99');
    mockUseListQuery.mockReturnValue(
      listResult({
        data: { ...listResult().data, content: [], totalElements: 25, totalPages: 2, first: false },
      }),
    );

    render(<AdminUserTable />);

    expect(lastReplacedQuery().get('page')).toBe('2');
  });

  it('상세보기를 누르면 memberId를 URL에 반영하고 패널에 정보를 표시한다', () => {
    mockUseDetailQuery.mockReturnValue(detailResult({ data: detail() }));

    const { rerender } = render(<AdminUserTable />);
    fireEvent.click(screen.getByRole('button', { name: '김민재 상세보기' }));
    expect(lastReplacedQuery().get('memberId')).toBe('1');

    // 실제 Next는 router.replace 후 useSearchParams가 새 값을 내며 리렌더한다.
    rerender(<AdminUserTable />);

    expect(mockUseDetailQuery).toHaveBeenLastCalledWith(1);
    const panel = screen.getByRole('dialog', { name: '회원 상세' });
    expect(within(panel).getByText('010-1234-5678')).toBeInTheDocument();
    expect(within(panel).getByRole('link', { name: 'https://github.com/minjae' })).toHaveAttribute(
      'href',
      'https://github.com/minjae',
    );
  });

  it('URL에 memberId가 있으면 상세를 조회한다(뒤로/앞으로 이동 대응)', () => {
    setUrl('memberId=1');
    mockUseDetailQuery.mockReturnValue(detailResult({ data: detail() }));

    render(<AdminUserTable />);

    expect(mockUseDetailQuery).toHaveBeenLastCalledWith(1);
    expect(screen.getByRole('dialog', { name: '회원 상세' })).toBeInTheDocument();
  });

  it('본인 계정 상세에는 변경 불가 안내를 띄운다', () => {
    setUrl('memberId=1');
    mockUseMyProfileQuery.mockReturnValue({ data: { memberId: 1 } });
    mockUseDetailQuery.mockReturnValue(detailResult({ data: detail({ memberId: 1 }) }));

    render(<AdminUserTable />);

    expect(
      screen.getByText('본인 계정의 역할·계정 상태는 관리자 본인이 변경할 수 없습니다.'),
    ).toBeInTheDocument();
  });

  it('로딩·빈·403 상태를 각각 보여준다', () => {
    mockUseListQuery.mockReturnValue(listResult({ isLoading: true, data: undefined }));
    const { rerender } = render(<AdminUserTable />);
    expect(screen.getByText('사용자 정보를 불러오고 있습니다.')).toBeInTheDocument();

    mockUseListQuery.mockReturnValue(
      listResult({ data: { ...listResult().data, content: [], totalElements: 0 } }),
    );
    rerender(<AdminUserTable key="empty" />);
    expect(screen.getByText('등록된 사용자가 없습니다.')).toBeInTheDocument();

    mockUseListQuery.mockReturnValue(
      listResult({ isError: true, data: undefined, error: new ApiError('forbidden', 403) }),
    );
    rerender(<AdminUserTable key="forbidden" />);
    expect(screen.getByText('접근 권한이 없습니다.')).toBeInTheDocument();
  });

  it('조회 실패 시 다시 시도로 refetch한다', () => {
    mockUseListQuery.mockReturnValue(
      listResult({ isError: true, data: undefined, error: new Error('fail') }),
    );

    render(<AdminUserTable />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(mockRefetch).toHaveBeenCalled();
  });
});
