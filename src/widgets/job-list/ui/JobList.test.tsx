import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { JobListItem } from '@/entities/job';

import { JobList } from './JobList';

const JOBS: JobListItem[] = [
  {
    id: 'job-1',
    companyName: '한국전력공사',
    title: '2026년 고졸 채용형 인턴 모집',
    source: 'school',
    subLabel: 'MOU 채용',
    location: '서울',
    employmentType: '인턴',
    dDay: 17,
    deadlineLabel: '08.14 마감',
    isClosed: false,
    isBookmarked: false,
    detailHref: '/jobs/school/job-1',
  },
  {
    id: 'job-2',
    companyName: '카카오',
    title: '2026 소프트웨어 개발 인턴 채용',
    source: 'external',
    subLabel: '일반 채용',
    location: '서울',
    employmentType: '인턴',
    dDay: null,
    deadlineLabel: '상시 채용',
    isClosed: false,
    isBookmarked: false,
    detailHref: '/jobs/external/job-2',
  },
];

function renderJobList(overrides: Partial<ComponentProps<typeof JobList>> = {}) {
  const props: ComponentProps<typeof JobList> = {
    status: 'success',
    jobs: JOBS,
    totalCount: 24,
    currentPage: 1,
    totalPages: 3,
    onPageChange: vi.fn(),
    searchQuery: '',
    onSearchQueryChange: vi.fn(),
    includeClosed: true,
    onIncludeClosedChange: vi.fn(),
    onRetry: vi.fn(),
    ...overrides,
  };
  render(<JobList {...props} />);
  return props;
}

describe('JobList', () => {
  it('공고 수와 카드 목록을 표시한다', () => {
    renderJobList();

    expect(screen.getByText('24개')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('link', { name: /2026년 고졸 채용형 인턴 모집/ })).toHaveAttribute(
      'href',
      '/jobs/school/job-1',
    );
  });

  it('최초 로딩 상태에서 스켈레톤을 표시하고 개수·페이지네이션은 숨긴다', () => {
    renderJobList({ status: 'initialLoading', jobs: [] });

    expect(screen.getByRole('status', { name: '공고 목록을 불러오는 중' })).toBeInTheDocument();
    expect(screen.queryByText('24개')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '공고 목록 페이지' })).not.toBeInTheDocument();
  });

  it('빈 상태를 표시한다', () => {
    renderJobList({ status: 'empty', jobs: [] });

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('0개')).toBeInTheDocument();
  });

  it('오류 상태에서 다시 시도를 실행한다', () => {
    const onRetry = vi.fn();
    renderJobList({ status: 'error', jobs: [], onRetry });

    expect(screen.getByRole('alert')).toHaveTextContent('서버 오류가 발생했습니다.');
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('현재 페이지를 표시하고 페이지 이동 시 onPageChange를 호출한다', () => {
    const onPageChange = vi.fn();
    renderJobList({ currentPage: 2, totalPages: 3, onPageChange });

    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');

    fireEvent.click(screen.getByRole('button', { name: '3' }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('전체 페이지가 1개면 페이지네이션을 숨긴다', () => {
    renderJobList({ totalPages: 1 });

    expect(screen.queryByRole('navigation', { name: '공고 목록 페이지' })).not.toBeInTheDocument();
  });

  it('검색어를 입력하면 onSearchQueryChange를 호출한다', () => {
    const onSearchQueryChange = vi.fn();
    renderJobList({ onSearchQueryChange });

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '카카오' } });

    expect(onSearchQueryChange).toHaveBeenCalledWith('카카오');
  });

  it('"마감 공고 포함" 토글을 누르면 onIncludeClosedChange를 호출한다', () => {
    const onIncludeClosedChange = vi.fn();
    renderJobList({ includeClosed: true, onIncludeClosedChange });

    fireEvent.click(screen.getByRole('checkbox', { name: '마감 공고 포함' }));

    expect(onIncludeClosedChange).toHaveBeenCalledWith(false);
  });
});
