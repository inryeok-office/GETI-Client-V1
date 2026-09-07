import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MyProfile } from '@/entities/member';
import { ApiError } from '@/shared/api';

import { StaffSignupRequestPage } from './StaffSignupRequestPage';

const { mockUseMyProfileQuery, mockRefetch } = vi.hoisted(() => ({
  mockUseMyProfileQuery: vi.fn(),
  mockRefetch: vi.fn(),
}));

vi.mock('@/entities/member', async () => {
  const actual = await vi.importActual<typeof import('@/entities/member')>('@/entities/member');
  return {
    ...actual,
    useMyProfileQuery: mockUseMyProfileQuery,
  };
});

function profile(overrides: Partial<MyProfile> = {}): MyProfile {
  return {
    academicStatus: null,
    bio: null,
    cohort: null,
    department: null,
    desiredJob: null,
    email: 'teacher@gsm.hs.kr',
    githubUrl: null,
    isPublic: false,
    links: [],
    majors: [],
    memberId: 1,
    name: '김민욱',
    phone: null,
    profileImageUrl: null,
    roles: ['TEACHER'],
    status: 'PENDING',
    techStacks: [],
    ...overrides,
  };
}

function queryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: mockRefetch,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StaffSignupRequestPage', () => {
  it('로딩 중이면 안내 문구를 보여준다', () => {
    mockUseMyProfileQuery.mockReturnValue(queryResult({ isLoading: true }));

    render(<StaffSignupRequestPage />);

    expect(screen.getByText('승인 상태를 확인하는 중입니다.')).toBeInTheDocument();
  });

  it('401 오류면(로그인하지 않음) 요청 없음 빈 상태를 보여준다', () => {
    mockUseMyProfileQuery.mockReturnValue(
      queryResult({
        isError: true,
        error: new ApiError('인증이 필요합니다.', 401, 'UNAUTHORIZED'),
      }),
    );

    render(<StaffSignupRequestPage />);

    expect(screen.getByText('가입 요청 내역이 없습니다.')).toBeInTheDocument();
  });

  it('401이 아닌 오류면 재시도 가능한 에러를 보여준다', () => {
    mockUseMyProfileQuery.mockReturnValue(
      queryResult({ isError: true, error: new ApiError('서버 오류', 500, 'INTERNAL_ERROR') }),
    );

    render(<StaffSignupRequestPage />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getByText('승인 상태를 불러올 수 없습니다.')).toBeInTheDocument();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('PENDING이면 승인 대기 상태를 이름·이메일과 함께 보여준다', () => {
    mockUseMyProfileQuery.mockReturnValue(
      queryResult({ data: profile({ status: 'PENDING', name: '김민욱' }) }),
    );

    render(<StaffSignupRequestPage />);

    expect(screen.getByText('교직원 승인 상태')).toBeInTheDocument();
    expect(screen.getByText('김민욱')).toBeInTheDocument();
    expect(screen.getByText('승인 대기')).toBeInTheDocument();
  });

  it('ACTIVE + TEACHER Role이면 승인됨 상태와 로그인 버튼을 보여준다', () => {
    mockUseMyProfileQuery.mockReturnValue(
      queryResult({ data: profile({ status: 'ACTIVE', roles: ['TEACHER'] }) }),
    );

    render(<StaffSignupRequestPage />);

    expect(screen.getByText('승인됨')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인하러 가기' })).toBeInTheDocument();
  });

  it('ACTIVE인데 TEACHER Role이 없으면 요청 없음 빈 상태를 보여준다', () => {
    mockUseMyProfileQuery.mockReturnValue(
      queryResult({ data: profile({ status: 'ACTIVE', roles: ['STUDENT'] }) }),
    );

    render(<StaffSignupRequestPage />);

    expect(screen.getByText('가입 요청 내역이 없습니다.')).toBeInTheDocument();
  });
});
