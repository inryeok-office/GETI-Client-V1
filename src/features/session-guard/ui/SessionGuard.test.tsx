import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';

import { SessionGuard } from './SessionGuard';

const { mockRefetch, mockReplace, mockUseSessionQuery } = vi.hoisted(() => ({
  mockRefetch: vi.fn(),
  mockReplace: vi.fn(),
  mockUseSessionQuery: vi.fn(),
}));

vi.mock('@/entities/session', () => ({
  useSessionQuery: mockUseSessionQuery,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile',
  useRouter: () => ({ replace: mockReplace }),
}));

function mockSuccess(roles: Array<'DEVELOPER' | 'STUDENT' | 'TEACHER'>) {
  mockUseSessionQuery.mockReturnValue({
    data: { memberId: 7, roles },
    error: null,
    isError: false,
    isPending: false,
    refetch: mockRefetch,
  });
}

function mockError(error: ApiError) {
  mockUseSessionQuery.mockReturnValue({
    data: undefined,
    error,
    isError: true,
    isPending: false,
    refetch: mockRefetch,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSuccess(['STUDENT']);
});

describe('SessionGuard', () => {
  it('세션 확인 중에는 보호 화면을 노출하지 않는다', () => {
    mockUseSessionQuery.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isPending: true,
      refetch: mockRefetch,
    });

    render(
      <SessionGuard allowedRoles={['STUDENT']}>
        <div>보호 화면</div>
      </SessionGuard>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('로그인 정보를 확인하는 중입니다.');
    expect(screen.queryByText('보호 화면')).not.toBeInTheDocument();
  });

  it('STUDENT 역할은 Student 화면에 접근할 수 있다', () => {
    mockSuccess(['STUDENT']);

    render(
      <SessionGuard allowedRoles={['STUDENT']}>
        <div>보호 화면</div>
      </SessionGuard>,
    );

    expect(screen.getByText('보호 화면')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it.each(['TEACHER', 'DEVELOPER'] as const)('%s 역할은 Admin 화면에 접근할 수 있다', (role) => {
    mockSuccess([role]);

    render(
      <SessionGuard allowedRoles={['TEACHER', 'DEVELOPER']}>
        <div>관리자 화면</div>
      </SessionGuard>,
    );

    expect(screen.getByText('관리자 화면')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('허용되지 않은 역할이면 권한 없음 화면으로 이동한다', async () => {
    mockSuccess(['STUDENT']);

    render(
      <SessionGuard allowedRoles={['TEACHER', 'DEVELOPER']}>
        <div>관리자 화면</div>
      </SessionGuard>,
    );

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/forbidden'));
    expect(screen.queryByText('관리자 화면')).not.toBeInTheDocument();
  });

  it.each([
    [new ApiError('unauthorized', 401, 'UNAUTHORIZED'), '/auth/expired'],
    [new ApiError('forbidden', 403, 'FORBIDDEN'), '/forbidden'],
    [new ApiError('Network Error'), '/network-error'],
  ] as const)('세션 오류를 상태별 화면으로 분기한다', async (error, expectedPath) => {
    mockError(error);

    render(
      <SessionGuard allowedRoles={['STUDENT']}>
        <div>보호 화면</div>
      </SessionGuard>,
    );

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(expectedPath));
    expect(screen.queryByText('보호 화면')).not.toBeInTheDocument();
  });

  it('그 외 세션 오류는 재시도할 수 있다', () => {
    mockError(new ApiError('server error', 500, 'INTERNAL_SERVER_ERROR'));

    render(
      <SessionGuard allowedRoles={['STUDENT']}>
        <div>보호 화면</div>
      </SessionGuard>,
    );
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getByRole('alert')).toHaveTextContent('로그인 정보를 확인하지 못했습니다.');
    expect(mockRefetch).toHaveBeenCalledOnce();
  });
});
