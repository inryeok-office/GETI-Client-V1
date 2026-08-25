import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StudentListPage } from './StudentListPage';

const {
  mockRouterReplace,
  mockUsePathname,
  mockUseStudentListQuery,
  mockUseStudentMajorOptionsQuery,
  mockUseStudentTechStackOptionsQuery,
} = vi.hoisted(() => ({
  mockRouterReplace: vi.fn(),
  mockUsePathname: vi.fn(),
  mockUseStudentListQuery: vi.fn(),
  mockUseStudentMajorOptionsQuery: vi.fn(),
  mockUseStudentTechStackOptionsQuery: vi.fn(),
}));

vi.mock('@/entities/student', async () => {
  const actual = await vi.importActual<typeof import('@/entities/student')>('@/entities/student');
  return {
    ...actual,
    useStudentListQuery: mockUseStudentListQuery,
    useStudentMajorOptionsQuery: mockUseStudentMajorOptionsQuery,
    useStudentTechStackOptionsQuery: mockUseStudentTechStackOptionsQuery,
  };
});

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
  useRouter: () => ({ replace: mockRouterReplace }),
}));

const PUBLIC_STUDENT = {
  memberId: 7,
  name: '홍길동',
  profileImageUrl: null,
  cohort: 10,
  department: 'SMART_IOT' as const,
  public: true,
};

function listResult(
  overrides: Partial<{
    content: (typeof PUBLIC_STUDENT)[];
    isError: boolean;
    isFetching: boolean;
    isLoading: boolean;
    totalPages: number;
  }> = {},
) {
  return {
    data: {
      content: overrides.content ?? [],
      first: true,
      last: true,
      page: 0,
      size: 20,
      totalElements: overrides.content?.length ?? 0,
      totalPages: overrides.totalPages ?? 0,
    },
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
    ...overrides,
  };
}

function metadataResult(data: unknown[] = []) {
  return { data, isError: false, isLoading: false, refetch: vi.fn() };
}

function lastReplacedParams(): URLSearchParams {
  const lastUrl = mockRouterReplace.mock.calls.at(-1)?.[0] as string;
  return new URLSearchParams(lastUrl.split('?')[1] ?? '');
}

beforeEach(() => {
  mockUsePathname.mockReturnValue('/students');
  mockUseStudentListQuery.mockReturnValue(listResult());
  mockUseStudentMajorOptionsQuery.mockReturnValue(
    metadataResult([{ majorId: 1, name: '웹 개발', active: true }]),
  );
  mockUseStudentTechStackOptionsQuery.mockReturnValue(
    metadataResult([{ techStackId: 10, name: 'React', category: 'FRONTEND' }]),
  );
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('StudentListPage', () => {
  it('이름이 없으면 목록 요청을 보내지 않고 검색 안내를 보여준다', () => {
    render(<StudentListPage />);

    expect(mockUseStudentListQuery).toHaveBeenCalledWith(null);
    expect(
      screen.getByRole('heading', { name: '학생 공개 프로필을 검색해보세요.' }),
    ).toBeInTheDocument();
  });

  it('URL의 검색·필터·페이지 상태를 실제 API 파라미터로 복원한다', () => {
    mockUseStudentListQuery.mockReturnValue(
      listResult({ content: [PUBLIC_STUDENT], totalPages: 3 }),
    );

    render(
      <StudentListPage
        initialSearchParams={{
          q: '홍',
          page: '2',
          academicStatus: 'ENROLLED',
          cohort: '10',
          department: 'SMART_IOT',
          majorId: '1',
          techStackId: '10',
        }}
      />,
    );

    expect(mockUseStudentListQuery).toHaveBeenCalledWith({
      name: '홍',
      page: 1,
      size: 20,
      academicStatus: 'ENROLLED',
      cohort: 10,
      department: 'SMART_IOT',
      majorId: 1,
      techStackId: 10,
    });
    expect(screen.getByRole('link', { name: '프로필 보기' })).toHaveAttribute(
      'href',
      expect.stringContaining('/students/7?'),
    );
    expect(screen.getByRole('link', { name: '프로필 보기' })).toHaveAttribute(
      'href',
      expect.stringContaining('page=2'),
    );
  });

  it('이름 입력을 디바운스한 뒤 검색하고 URL에 유지한다', () => {
    vi.useFakeTimers();
    render(<StudentListPage />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '김철수' } });
    act(() => vi.advanceTimersByTime(300));

    expect(mockUseStudentListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: '김철수', page: 0 }),
    );
    expect(lastReplacedParams().get('q')).toBe('김철수');
  });

  it('학과 필터를 변경하면 실제 조회와 URL에 함께 반영한다', () => {
    render(<StudentListPage initialSearchParams={{ q: '홍' }} />);

    fireEvent.change(screen.getByLabelText('학과'), { target: { value: 'AI' } });

    expect(mockUseStudentListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ department: 'AI', page: 0 }),
    );
    expect(lastReplacedParams().get('department')).toBe('AI');
  });

  it.each([
    [{ isLoading: true }, '정보를 불러오는 중입니다.'],
    [{ content: [] }, '검색 결과가 없습니다.'],
    [
      { content: [{ ...PUBLIC_STUDENT, memberId: 8, public: false }] },
      '비공개 프로필만 검색되었습니다.',
    ],
  ])('%j 상태를 구분해 보여준다', (overrides, title) => {
    mockUseStudentListQuery.mockReturnValue(listResult(overrides));
    render(<StudentListPage initialSearchParams={{ q: '홍' }} />);

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('목록 오류에서 다시 시도하면 현재 Query를 refetch한다', () => {
    const result = listResult({ isError: true });
    mockUseStudentListQuery.mockReturnValue(result);
    render(<StudentListPage initialSearchParams={{ q: '홍' }} />);

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(result.refetch).toHaveBeenCalledOnce();
  });

  it('공개·비공개 결과가 섞이면 공개 프로필만 표시한다', () => {
    mockUseStudentListQuery.mockReturnValue(
      listResult({
        content: [
          PUBLIC_STUDENT,
          { ...PUBLIC_STUDENT, memberId: 8, name: '비공개 학생', public: false },
        ],
      }),
    );
    render(<StudentListPage initialSearchParams={{ q: '학생' }} />);

    expect(screen.getByRole('heading', { name: '홍길동' })).toBeInTheDocument();
    expect(screen.queryByText('비공개 학생')).not.toBeInTheDocument();
    expect(screen.getByText('현재 페이지 공개 프로필', { exact: false })).toHaveTextContent('1명');
  });

  it('페이지를 바꾸면 검색 조건을 유지한 채 page만 갱신한다', () => {
    mockUseStudentListQuery.mockReturnValue(
      listResult({ content: [PUBLIC_STUDENT], totalPages: 3 }),
    );
    render(<StudentListPage initialSearchParams={{ q: '홍', department: 'AI' }} />);

    fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(mockUseStudentListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: '홍', department: 'AI', page: 1 }),
    );
    expect(lastReplacedParams().get('page')).toBe('2');
    expect(lastReplacedParams().get('department')).toBe('AI');
  });
});
