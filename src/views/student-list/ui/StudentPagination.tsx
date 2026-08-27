'use client';

import type { ReactNode } from 'react';

import { Icon } from '@/shared/ui/icon';

interface StudentPaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export function StudentPagination({
  currentPage,
  onPageChange,
  totalPages,
}: StudentPaginationProps) {
  const pages = buildPageItems(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="학생 검색 결과 페이지">
      <PageButton
        ariaLabel="이전 페이지"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <Icon name="chevronRight" className="h-6 w-3 rotate-180" />
      </PageButton>

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex size-9 items-center justify-center text-sm font-bold text-neutral-600"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`flex size-9 items-center justify-center rounded-lg text-sm font-bold ${
              page === currentPage ? 'bg-primary-700 text-white' : 'text-neutral-900'
            }`}
          >
            {page}
          </button>
        ),
      )}

      <PageButton
        ariaLabel="다음 페이지"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <Icon name="chevronRight" className="h-6 w-3" />
      </PageButton>
    </nav>
  );
}

interface PageButtonProps {
  ariaLabel: string;
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
}

function PageButton({ ariaLabel, children, disabled, onClick }: PageButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-lg text-neutral-600 disabled:opacity-40"
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
