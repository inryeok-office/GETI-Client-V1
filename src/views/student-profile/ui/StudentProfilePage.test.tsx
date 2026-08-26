import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';

import { StudentProfilePage } from './StudentProfilePage';

const { mockUseStudentProfileQuery } = vi.hoisted(() => ({
  mockUseStudentProfileQuery: vi.fn(),
}));

vi.mock('@/entities/student', async () => {
  const actual = await vi.importActual<typeof import('@/entities/student')>('@/entities/student');
  return { ...actual, useStudentProfileQuery: mockUseStudentProfileQuery };
});

const PROFILE = {
  memberId: 7,
  name: '홍길동',
  profileImageUrl: null,
  cohort: 10,
  department: 'SMART_IOT' as const,
  majors: ['웹 개발'],
  techStacks: ['React', 'TypeScript'],
  desiredJob: '프론트엔드 개발자',
  bio: '사용자를 생각하는 개발자입니다.',
  links: [
    { label: 'GitHub', url: 'https://github.com/example' },
    { label: '안전하지 않은 링크', url: 'javascript:alert(1)' },
  ],
  profileRestricted: false,
  public: true,
};

function profileResult(
  overrides: Partial<{
    data: typeof PROFILE;
    error: Error | null;
    isError: boolean;
    isLoading: boolean;
  }> = {},
) {
  return {
    data: PROFILE,
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mockUseStudentProfileQuery.mockReturnValue(profileResult());
});

describe('StudentProfilePage', () => {
  it('실제 공개 프로필과 목록 검색 상태를 보존한 돌아가기 링크를 보여준다', () => {
    render(
      <StudentProfilePage
        studentId="7"
        returnSearchParams={{ q: '홍', page: '2', department: 'SMART_IOT' }}
      />,
    );

    expect(mockUseStudentProfileQuery).toHaveBeenCalledWith(7);
    expect(screen.getByRole('heading', { level: 1, name: '홍길동' })).toBeInTheDocument();
    expect(screen.getByText('10기 · 스마트IoT과 · 웹 개발')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/example',
    );
    expect(screen.queryByRole('link', { name: '안전하지 않은 링크' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '학생 찾기로 돌아가기' })).toHaveAttribute(
      'href',
      '/students?q=%ED%99%8D&page=2&department=SMART_IOT',
    );
  });

  it('비공개 제한 응답은 상세 필드를 노출하지 않고 비공개 상태를 보여준다', () => {
    mockUseStudentProfileQuery.mockReturnValue(
      profileResult({ data: { ...PROFILE, profileRestricted: true, public: false } }),
    );
    render(<StudentProfilePage studentId="7" />);

    expect(screen.getByRole('heading', { name: '비공개 프로필입니다.' })).toBeInTheDocument();
    expect(screen.queryByText(PROFILE.bio)).not.toBeInTheDocument();
  });

  it.each([
    [new ApiError('없음', 404), '학생 정보를 확인할 수 없습니다.'],
    [new ApiError('권한 없음', 403), '프로필을 볼 권한이 없습니다.'],
  ])('상세 예외를 구분한다', (error, title) => {
    mockUseStudentProfileQuery.mockReturnValue(profileResult({ error, isError: true }));
    render(<StudentProfilePage studentId="7" />);

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('잘못된 학생 ID는 요청하지 않고 이용 불가 상태를 보여준다', () => {
    render(<StudentProfilePage studentId="invalid" />);

    expect(mockUseStudentProfileQuery).toHaveBeenCalledWith(null);
    expect(
      screen.getByRole('heading', { name: '학생 정보를 확인할 수 없습니다.' }),
    ).toBeInTheDocument();
  });

  it('상세 로딩 상태를 보여준다', () => {
    mockUseStudentProfileQuery.mockReturnValue(profileResult({ isLoading: true }));
    render(<StudentProfilePage studentId="7" />);

    expect(
      screen.getByRole('heading', { name: '학생 프로필을 불러오는 중입니다.' }),
    ).toBeInTheDocument();
  });

  it('상세 조회 실패에서 다시 시도하면 현재 Query를 refetch한다', () => {
    const result = profileResult({ error: new Error('network'), isError: true });
    mockUseStudentProfileQuery.mockReturnValue(result);
    render(<StudentProfilePage studentId="7" />);

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(result.refetch).toHaveBeenCalledOnce();
  });
});
