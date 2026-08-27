'use client';

import type { ReactNode } from 'react';

import { JobCard, type JobListItem } from '@/entities/job';
import { Icon } from '@/shared/ui/icon';

import { BookmarkListEmpty } from './BookmarkListEmpty';
import { BookmarkListError } from './BookmarkListError';
import { BookmarkListSkeleton } from './BookmarkListSkeleton';
import { BookmarkRemovalError } from './BookmarkRemovalError';

export type BookmarkListStatus = 'empty' | 'error' | 'initialLoading' | 'pageLoading' | 'success';

interface BookmarkListProps {
  currentPage: number;
  jobs: JobListItem[];
  removalErrorJobId?: string | null;
  onPageChange: (page: number) => void;
  onRemoveBookmark: (jobId: string) => void;
  onRetry?: () => void;
  status: BookmarkListStatus;
  totalCount: number;
  totalPages: number;
}

export function BookmarkList({
  currentPage,
  jobs,
  removalErrorJobId = null,
  onPageChange,
  onRemoveBookmark,
  onRetry,
  status,
  totalCount,
  totalPages,
}: BookmarkListProps) {
  const showCount = status === 'success' || status === 'empty' || status === 'pageLoading';
  const showPagination = (status === 'success' || status === 'pageLoading') && totalPages > 1;

  const handleBookmarkChange = (job: JobListItem, isBookmarked: boolean) => {
    if (isBookmarked) return;
    onRemoveBookmark(job.id);
  };

  return (
    <div>
      {showCount ? (
        <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111]">
          저장한 공고 <strong className="font-bold">{totalCount}개</strong>
        </p>
      ) : null}

      <div className={showCount ? 'mt-[24px]' : ''}>
        {(status === 'initialLoading' || status === 'pageLoading') && <BookmarkListSkeleton />}
        {status === 'error' ? <BookmarkListError onRetry={onRetry} /> : null}
        {status === 'empty' ? <BookmarkListEmpty /> : null}
        {status === 'success' ? (
          <div className="flex flex-col gap-[16px]">
            {jobs.map((job) => (
              <div key={job.id} className="relative">
                <JobCard job={job} onBookmarkChange={handleBookmarkChange} />
                {removalErrorJobId === job.id ? <BookmarkRemovalError /> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {showPagination ? (
        <div className="mt-[32px]">
          <BookmarkPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      ) : null}
    </div>
  );
}

interface BookmarkPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function BookmarkPagination({ currentPage, totalPages, onPageChange }: BookmarkPaginationProps) {
  const pages = buildPageItems(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-[8px]" aria-label="북마크 목록 페이지">
      <PaginationButton
        ariaLabel="이전 페이지"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <Icon name="chevronRight" className="h-[24px] w-[12px] rotate-180" />
      </PaginationButton>

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex size-[36px] items-center justify-center text-[14px] leading-[1.5] font-bold tracking-[-0.14px] text-[#525252]"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`flex size-[36px] items-center justify-center rounded-[8px] text-[14px] leading-[1.5] font-bold tracking-[-0.14px] ${
              page === currentPage ? 'bg-[#17627a] text-white' : 'text-[#111]'
            }`}
          >
            {page}
          </button>
        ),
      )}

      <PaginationButton
        ariaLabel="다음 페이지"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <Icon name="chevronRight" className="h-[24px] w-[12px]" />
      </PaginationButton>
    </nav>
  );
}

interface PaginationButtonProps {
  ariaLabel: string;
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
}

function PaginationButton({ ariaLabel, children, disabled, onClick }: PaginationButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="flex size-[36px] items-center justify-center rounded-[8px] text-[#525252] disabled:opacity-40"
    >
      {children}
    </button>
  );
}

type PageItem = number | 'ellipsis';

function buildPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage <= 3) return [1, 2, 3, 'ellipsis', totalPages];

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}
