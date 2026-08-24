'use client';

import type { ReactNode } from 'react';

import { Icon } from '@/shared/ui/icon';

interface CompanyPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * 기업 목록 하단 페이지네이션. 인증 없이도 호출 가능한 API지만 검색·필터 상태를 화면이
 * 직접 들고 있어(Issue #156), 페이지 이동도 URL 링크가 아니라 `onPageChange` 콜백으로 처리한다
 * (`widgets/job-list`의 `JobPagination`과 동일한 패턴).
 */
export function CompanyPagination({ currentPage, totalPages, onPageChange }: CompanyPaginationProps) {
  const pages = buildPageItems(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="기업 목록 페이지">
      <PageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        ariaLabel="이전 페이지"
      >
        <Icon name="chevronRight" className="h-6 w-3 rotate-180" />
      </PageButton>

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex size-9 items-center justify-center text-sm leading-[1.5] font-bold tracking-[-0.14px] text-neutral-600"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`flex size-9 items-center justify-center rounded-lg text-sm leading-[1.5] font-bold tracking-[-0.14px] ${
              page === currentPage ? 'bg-primary-700 text-white' : 'text-neutral-900'
            }`}
          >
            {page}
          </button>
        ),
      )}

      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        ariaLabel="다음 페이지"
      >
        <Icon name="chevronRight" className="h-6 w-3" />
      </PageButton>
    </nav>
  );
}

interface PageButtonProps {
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  children: ReactNode;
}

function PageButton({ onClick, disabled, ariaLabel, children }: PageButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex size-9 items-center justify-center rounded-lg text-neutral-600 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

type PageItem = number | 'ellipsis';

const ELLIPSIS: PageItem = 'ellipsis';

function buildPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, ELLIPSIS, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, ELLIPSIS, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, ELLIPSIS, currentPage - 1, currentPage, currentPage + 1, ELLIPSIS, totalPages];
}
