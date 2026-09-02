import { fireEvent, render, screen, within } from '@testing-library/react';
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

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/admin/users',
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

beforeEach(() => {
  mockUseListQuery.mockReturnValue(listResult());
  mockUseDetailQuery.mockReturnValue(detailResult());
  mockUseMyProfileQuery.mockReturnValue({ data: { memberId: 99 } });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AdminUserTable', () => {
  it('회원 목록과 검색·필터를 표시한다', () => {
    render(<AdminUserTable />);

    expect(screen.getByRole('heading', { name: '사용자 관리', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('총 1명')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('이름으로 검색해 보세요.')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '역할 필터' })).toBeInTheDocument();
    expect(screen.getByText('김민재')).toBeInTheDocument();
    expect(screen.getByText('5기 · 소프트웨어개발과')).toBeInTheDocument();

    const list = screen.getByRole('region', { name: '사용자 목록' });
    expect(within(list).getByRole('table')).toHaveClass('w-[1620px]', 'min-w-[1620px]');
  });

  it('초기 검색어·필터를 그 값으로 목록 조회에 넘긴다', () => {
    render(
      <AdminUserTable initialSearchParams={{ q: '보검', role: 'TEACHER', status: 'SUSPENDED' }} />,
    );

    expect(mockUseListQuery).toHaveBeenCalledWith(
      expect.objectContaining({ name: '보검', role: 'TEACHER', status: 'SUSPENDED', page: 0 }),
    );
  });

  it('역할 필터를 바꾸면 그 값으로 다시 조회한다', () => {
    render(<AdminUserTable />);

    fireEvent.click(screen.getByRole('combobox', { name: '역할 필터' }));
    fireEvent.click(screen.getByRole('option', { name: '개발자' }));

    expect(mockUseListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ role: 'DEVELOPER', page: 0 }),
    );
  });

  it('로딩·빈·오류 상태를 각각 보여준다', () => {
    mockUseListQuery.mockReturnValue(listResult({ isLoading: true, data: undefined }));
    const { rerender } = render(<AdminUserTable />);
    expect(screen.getByText('사용자 정보를 불러오고 있습니다.')).toBeInTheDocument();

    mockUseListQuery.mockReturnValue(
      listResult({ data: { ...listResult().data, content: [], totalElements: 0 } }),
    );
    rerender(<AdminUserTable key="empty" />);
    expect(screen.getByText('등록된 사용자가 없습니다.')).toBeInTheDocument();

    mockUseListQuery.mockReturnValue(
      listResult({ isError: true, data: undefined, error: new Error('fail') }),
    );
    rerender(<AdminUserTable key="error" />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('403이면 권한 없음 안내를 보여준다', () => {
    mockUseListQuery.mockReturnValue(
      listResult({ isError: true, data: undefined, error: new ApiError('forbidden', 403) }),
    );

    render(<AdminUserTable />);

    expect(screen.getByText('접근 권한이 없습니다.')).toBeInTheDocument();
  });

  it('상세보기를 누르면 memberId로 상세를 조회하고 패널에 정보를 표시한다', () => {
    mockUseDetailQuery.mockReturnValue(detailResult({ data: detail() }));

    render(<AdminUserTable />);
    fireEvent.click(screen.getByRole('button', { name: '김민재 상세보기' }));

    expect(mockUseDetailQuery).toHaveBeenLastCalledWith(1);
    const panel = screen.getByRole('dialog', { name: '회원 상세' });
    expect(within(panel).getByText('010-1234-5678')).toBeInTheDocument();
    expect(within(panel).getByRole('link', { name: 'https://github.com/minjae' })).toHaveAttribute(
      'href',
      'https://github.com/minjae',
    );
  });

  it('본인 계정 상세에는 변경 불가 안내를 띄운다', () => {
    mockUseMyProfileQuery.mockReturnValue({ data: { memberId: 1 } });
    mockUseDetailQuery.mockReturnValue(detailResult({ data: detail({ memberId: 1 }) }));

    render(<AdminUserTable />);
    fireEvent.click(screen.getByRole('button', { name: '김민재 상세보기' }));

    expect(
      screen.getByText('본인 계정의 역할·계정 상태는 관리자 본인이 변경할 수 없습니다.'),
    ).toBeInTheDocument();
  });

  it('상세 조회 실패 시 패널에서 다시 시도할 수 있다', () => {
    mockUseDetailQuery.mockReturnValue(detailResult({ isError: true }));

    render(<AdminUserTable />);
    fireEvent.click(screen.getByRole('button', { name: '김민재 상세보기' }));

    const panel = screen.getByRole('dialog', { name: '회원 상세' });
    fireEvent.click(within(panel).getByRole('button', { name: '다시 시도' }));
    expect(mockRefetch).toHaveBeenCalled();
  });
});
