import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MyProfile } from '@/entities/member';

import { MyProfilePage } from './MyProfilePage';

const { mockUseMajorMetadataQuery, mockUseMyProfileQuery, mockUseTechStackMetadataQuery } =
  vi.hoisted(() => ({
    mockUseMajorMetadataQuery: vi.fn(),
    mockUseMyProfileQuery: vi.fn(),
    mockUseTechStackMetadataQuery: vi.fn(),
  }));

vi.mock('@/entities/member', async () => {
  const actual = await vi.importActual<typeof import('@/entities/member')>('@/entities/member');
  return {
    ...actual,
    useMajorMetadataQuery: mockUseMajorMetadataQuery,
    useMyProfileQuery: mockUseMyProfileQuery,
    useTechStackMetadataQuery: mockUseTechStackMetadataQuery,
  };
});

const MAJORS = [
  { active: true, majorId: 1, name: '백엔드' },
  { active: true, majorId: 2, name: '프론트엔드' },
  { active: true, majorId: 3, name: '디자인' },
];
const TECH_STACKS = [
  { category: 'FRONTEND' as const, name: 'React', techStackId: 10 },
  { category: 'FRONTEND' as const, name: 'TypeScript', techStackId: 11 },
  { category: 'FRONTEND' as const, name: 'Next.js', techStackId: 12 },
];

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
const mockMajorRefetch = vi.fn();
const mockTechStackRefetch = vi.fn();

beforeEach(() => {
  mockRefetch.mockReset();
  mockMajorRefetch.mockReset();
  mockTechStackRefetch.mockReset();
  mockUseMyProfileQuery.mockReturnValue({
    data: PROFILE,
    isError: false,
    isLoading: false,
    refetch: mockRefetch,
  });
  mockUseMajorMetadataQuery.mockReturnValue({
    data: MAJORS,
    isError: false,
    isLoading: false,
    refetch: mockMajorRefetch,
  });
  mockUseTechStackMetadataQuery.mockReturnValue({
    data: TECH_STACKS,
    isError: false,
    isLoading: false,
    refetch: mockTechStackRefetch,
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
    expect(screen.getByRole('switch', { name: '추천 활용 (변경 불가)' })).toBeDisabled();
    expect(screen.getByRole('heading', { name: '공개 프로필 미리보기' })).toBeInTheDocument();
    const preview = screen
      .getByRole('heading', { name: '공개 프로필 미리보기' })
      .closest('section');
    expect(preview).not.toBeNull();
    expect(within(preview as HTMLElement).getByText('공개')).toBeInTheDocument();
    expect(within(preview as HTMLElement).getByText('프론트엔드')).toBeInTheDocument();
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
    expect(within(preview as HTMLElement).getByText('비공개')).toBeInTheDocument();
    expect(within(preview as HTMLElement).getByText('새로운 자기소개입니다.')).toBeInTheDocument();
  });

  it('변경한 전공과 기술 스택을 공개 프로필 미리보기에 반영한다', () => {
    render(<MyProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: '전공' }));
    fireEvent.click(screen.getByRole('option', { name: '백엔드' }));
    fireEvent.click(screen.getByRole('button', { name: 'React 기술 삭제' }));
    fireEvent.click(screen.getByRole('button', { name: '미리보기 새로고침' }));

    const preview = screen
      .getByRole('heading', { name: '공개 프로필 미리보기' })
      .closest('section');
    expect(preview).not.toBeNull();
    expect(within(preview as HTMLElement).getByText('백엔드')).toBeInTheDocument();
    expect(within(preview as HTMLElement).queryByText('React')).not.toBeInTheDocument();
    expect(within(preview as HTMLElement).getByText('TypeScript')).toBeInTheDocument();
  });

  it('공개 항목이 없으면 미리보기에서 항목별 빈 상태를 표시한다', () => {
    mockUseMyProfileQuery.mockReturnValue({
      data: { ...PROFILE, bio: null, links: [], majors: [], techStacks: [] },
      isError: false,
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<MyProfilePage />);

    expect(screen.getByText('등록된 전공이 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('등록된 자기소개가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('등록된 기술 스택이 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('등록된 URL이 없습니다.')).toBeInTheDocument();
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

  it('전공 메타데이터 조회에 실패하면 다시 조회한다', () => {
    mockUseMajorMetadataQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      refetch: mockMajorRefetch,
    });

    render(<MyProfilePage />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(mockMajorRefetch).toHaveBeenCalled();
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('선택 가능한 기술 스택이 없으면 메타데이터 빈 상태를 표시한다', () => {
    mockUseTechStackMetadataQuery.mockReturnValue({
      data: [],
      isError: false,
      isLoading: false,
      refetch: mockTechStackRefetch,
    });

    render(<MyProfilePage />);

    expect(screen.getByText('선택 가능한 프로필 정보가 없습니다.')).toBeInTheDocument();
  });
});
