import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { JobListItem } from '@/entities/job';

import { BookmarkList } from './BookmarkList';

const BOOKMARKED_JOBS: JobListItem[] = [
  {
    id: 'job-1',
    companyName: '테스트 기업 1',
    title: '첫 번째 북마크 공고',
    source: 'school',
    subLabel: 'MOU   ·   교내 모집',
    location: '서울',
    employmentType: '인턴',
    dDay: 3,
    deadlineLabel: '08.14 마감',
    isClosed: false,
    isBookmarked: true,
    detailHref: '/jobs/school/1',
  },
  {
    id: 'job-2',
    companyName: '테스트 기업 2',
    title: '두 번째 북마크 공고',
    source: 'external',
    subLabel: '외부 공고   ·   기업 채용',
    location: '광주',
    employmentType: '정규직',
    dDay: 7,
    deadlineLabel: '08.18 마감',
    isClosed: false,
    isBookmarked: true,
    detailHref: '/jobs/external/2',
  },
];

describe('BookmarkList', () => {
  it('북마크를 해제하면 해당 공고와 개수를 갱신한다', () => {
    render(<BookmarkList initialJobs={BOOKMARKED_JOBS} status="success" />);

    fireEvent.click(screen.getAllByRole('button', { name: '북마크 해제' })[0]);

    expect(screen.queryByText('첫 번째 북마크 공고')).not.toBeInTheDocument();
    expect(screen.getByText('저장한 공고')).toHaveTextContent('1개');
    expect(screen.getByText('두 번째 북마크 공고')).toBeInTheDocument();
  });

  it('마지막 북마크를 해제하면 빈 상태를 표시한다', () => {
    render(<BookmarkList initialJobs={[BOOKMARKED_JOBS[0]]} status="success" />);

    fireEvent.click(screen.getByRole('button', { name: '북마크 해제' }));

    expect(screen.getByText('북마크한 공고가 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '채용 공고 확인하기' })).toHaveAttribute(
      'href',
      '/jobs',
    );
  });

  it('북마크 해제에 실패하면 공고를 유지하고 오류를 알린다', () => {
    render(
      <BookmarkList
        initialJobs={[BOOKMARKED_JOBS[0]]}
        mockRemovalResult="error"
        status="success"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '북마크 해제' }));

    expect(screen.getByRole('alert')).toHaveTextContent('북마크를 해제하지 못했습니다.');
    expect(screen.getByText('첫 번째 북마크 공고')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '북마크 해제' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('로딩 상태를 안내한다', () => {
    render(<BookmarkList initialJobs={BOOKMARKED_JOBS} status="loading" />);

    expect(screen.getByRole('status', { name: '북마크 목록을 불러오는 중' })).toBeInTheDocument();
  });

  it('오류 상태에서 다시 시도를 실행한다', () => {
    const handleRetry = vi.fn();
    render(<BookmarkList initialJobs={[]} status="error" onRetry={handleRetry} />);

    expect(screen.queryByText('북마크한 공고가 없습니다.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(handleRetry).toHaveBeenCalledOnce();
    expect(screen.getByText('북마크한 공고가 없습니다.')).toBeInTheDocument();
  });
});
