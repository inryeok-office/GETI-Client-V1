import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { JobListItem } from '@/entities/job';

import { BookmarkList } from './BookmarkList';

const BOOKMARKED_JOBS: JobListItem[] = [
  {
    id: '1',
    companyName: '테스트 기업 1',
    title: '첫 번째 북마크 공고',
    source: 'school',
    subLabel: 'MOU 채용',
    location: '서울',
    employmentType: '인턴',
    dDay: 3,
    deadlineLabel: '08.14 마감',
    isClosed: false,
    isBookmarked: true,
    detailHref: '/jobs/school/1',
  },
  {
    id: '2',
    companyName: '테스트 기업 2',
    title: '두 번째 북마크 공고',
    source: 'external',
    subLabel: '일반 채용',
    location: '광주',
    employmentType: '정규직',
    dDay: 7,
    deadlineLabel: '08.18 마감',
    isClosed: false,
    isBookmarked: true,
    detailHref: '/jobs/external/2',
  },
];

function renderBookmarkList(props: Partial<React.ComponentProps<typeof BookmarkList>> = {}) {
  return render(
    <BookmarkList
      currentPage={1}
      jobs={BOOKMARKED_JOBS}
      status="success"
      totalCount={BOOKMARKED_JOBS.length}
      totalPages={1}
      onPageChange={vi.fn()}
      onRemoveBookmark={vi.fn()}
      {...props}
    />,
  );
}

describe('BookmarkList', () => {
  it('북마크 해제 버튼을 누르면 대상 공고 ID를 전달한다', () => {
    const handleRemoveBookmark = vi.fn();
    renderBookmarkList({ onRemoveBookmark: handleRemoveBookmark });

    fireEvent.click(screen.getAllByRole('button', { pressed: true })[0]);

    expect(handleRemoveBookmark).toHaveBeenCalledWith('1');
  });

  it('북마크 해제 실패 대상에는 오류 안내를 표시한다', () => {
    renderBookmarkList({ removalErrorJobId: '1' });

    expect(screen.getByRole('alert')).toHaveTextContent('북마크를 해제하지 못했습니다');
    expect(screen.getByText('첫 번째 북마크 공고')).toBeInTheDocument();
  });

  it('빈 상태를 표시한다', () => {
    renderBookmarkList({ jobs: [], status: 'empty', totalCount: 0 });

    expect(screen.getByText('북마크한 공고가 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '채용 공고 확인하기' })).toHaveAttribute(
      'href',
      '/jobs',
    );
  });

  it('로딩 상태를 안내한다', () => {
    renderBookmarkList({ status: 'initialLoading' });

    expect(screen.getByRole('status', { name: '북마크 목록을 불러오는 중' })).toBeInTheDocument();
  });

  it('에러 상태에서 다시 시도를 실행한다', () => {
    const handleRetry = vi.fn();
    renderBookmarkList({ jobs: [], status: 'error', onRetry: handleRetry });

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it('페이지가 여러 개면 페이지네이션을 표시하고 페이지 변경을 실행한다', () => {
    const handlePageChange = vi.fn();
    renderBookmarkList({ currentPage: 2, totalPages: 3, onPageChange: handlePageChange });

    fireEvent.click(screen.getByRole('button', { name: '3' }));

    expect(screen.getByRole('navigation', { name: '북마크 목록 페이지' })).toBeInTheDocument();
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });
});
