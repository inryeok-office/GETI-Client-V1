import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MyProfile } from '@/entities/member';

import { MyProfilePage } from './MyProfilePage';

const { mockUseMyProfileQuery } = vi.hoisted(() => ({ mockUseMyProfileQuery: vi.fn() }));

vi.mock('@/entities/member', async () => {
  const actual = await vi.importActual<typeof import('@/entities/member')>('@/entities/member');
  return { ...actual, useMyProfileQuery: mockUseMyProfileQuery };
});

const PROFILE: MyProfile = {
  academicStatus: 'ENROLLED',
  bio: '사용자 경험을 고려하는 프론트엔드 개발자입니다.',
  cohort: 9,
  department: 'SW_DEVELOPMENT',
  desiredJob: 'Frontend Developer',
  email: 'student@example.com',
  githubUrl: 'https://github.com/geti-student',
  isPublic: true,
  links: [{ label: '기술 블로그', url: 'https://blog.example.com' }],
  majors: ['프론트엔드'],
  memberId: 1,
  name: '김게티',
  phone: '010-1234-5678',
  profileImageUrl: null,
  roles: ['STUDENT'],
  status: 'ACTIVE',
  techStacks: ['React', 'TypeScript'],
};

const mockRefetch = vi.fn();

beforeEach(() => {
  mockRefetch.mockReset();
  mockUseMyProfileQuery.mockReturnValue({
    data: PROFILE,
    isError: false,
    isLoading: false,
    refetch: mockRefetch,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('MyProfilePage', () => {
  it('내 프로필 편집 폼과 공개 프로필 미리보기를 보여준다', () => {
    render(<MyProfilePage />);

    expect(screen.getByRole('heading', { level: 1, name: '내 프로필' })).toBeInTheDocument();
    expect(screen.getByLabelText('자기소개')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전공' })).toHaveTextContent('프론트엔드');
    expect(screen.getByRole('switch', { name: '프로필 공개' })).toBeChecked();
    expect(screen.getByRole('heading', { name: '공개 프로필 미리보기' })).toBeInTheDocument();
    expect(screen.getByText('김게티 (9기)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'https://blog.example.com' })).toHaveAttribute(
      'href',
      'https://blog.example.com',
    );
    expect(screen.getByRole('link', { name: 'https://blog.example.com' })).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  it('기술과 URL을 로컬 상태에서 추가하고 삭제한다', () => {
    render(<MyProfilePage />);

    const skillInput = screen.getByLabelText('기술 스택 추가');
    fireEvent.change(skillInput, { target: { value: 'Next.js' } });
    fireEvent.keyDown(skillInput, { key: 'Enter' });
    expect(screen.getByText('Next.js')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('URL 1'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: '링크 추가' }));
    expect(screen.getByLabelText('URL 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'URL 1 삭제' }));
    expect(screen.queryByDisplayValue('https://example.com')).not.toBeInTheDocument();
  });

  it('최초 프로필과 같은 전공 드롭다운에서 전공을 변경한다', () => {
    render(<MyProfilePage />);

    const majorSelect = screen.getByRole('button', { name: '전공' });
    fireEvent.click(majorSelect);

    expect(screen.getByRole('listbox', { name: '전공 목록' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: '프론트엔드' }));

    expect(majorSelect).toHaveTextContent('프론트엔드');
    expect(screen.queryByRole('listbox', { name: '전공 목록' })).not.toBeInTheDocument();
  });

  it('토글을 조작하고 미리보기를 현재 입력값으로 새로고침한다', () => {
    render(<MyProfilePage />);

    const profileSwitch = screen.getByRole('switch', { name: '프로필 공개' });
    fireEvent.click(profileSwitch);
    expect(profileSwitch).not.toBeChecked();

    fireEvent.change(screen.getByLabelText('자기소개'), {
      target: { value: '새로운 자기소개입니다.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '미리보기 새로고침' }));

    const preview = screen
      .getByRole('heading', { name: '공개 프로필 미리보기' })
      .closest('section');
    expect(preview).not.toBeNull();
    expect(within(preview as HTMLElement).getByText('새로운 자기소개입니다.')).toBeInTheDocument();
  });

  it('저장 중 상태를 거쳐 저장 완료 토스트를 보여준다', () => {
    vi.useFakeTimers();
    render(<MyProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));
    expect(screen.getByText('변경사항을 저장 중입니다.')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.getByText('변경사항이 저장되었습니다.')).toBeInTheDocument();
  });

  it.each([
    ['loading', '변경사항을 저장 중입니다.'],
    ['success', '변경사항이 저장되었습니다.'],
    ['error', '변경사항 저장에 실패했습니다.'],
  ] as const)('%s 정적 상태를 확인할 수 있다', (initialSaveStatus, message) => {
    render(<MyProfilePage initialSaveStatus={initialSaveStatus} />);

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('프로필 조회 중 로딩 상태를 표시한다', () => {
    mockUseMyProfileQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
      refetch: mockRefetch,
    });

    render(<MyProfilePage />);

    expect(screen.getByText('내 프로필을 불러오는 중입니다.')).toBeInTheDocument();
  });

  it('프로필 조회 실패 상태에서 다시 조회한다', () => {
    mockUseMyProfileQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<MyProfilePage />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('조회 결과가 없으면 빈 상태를 표시한다', () => {
    mockUseMyProfileQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<MyProfilePage />);

    expect(screen.getByText('등록된 프로필이 없습니다.')).toBeInTheDocument();
  });
});
