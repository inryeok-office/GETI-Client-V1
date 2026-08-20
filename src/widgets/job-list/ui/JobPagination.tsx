'use client';

import type { ReactNode } from 'react';

import { Icon } from '@/shared/ui/icon';

interface JobPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * 공고 목록 하단 페이지네이션. 인증이 필요한 API라 페이지 전체가 클라이언트에서 데이터를 받아오므로
 * (Issue #122), 페이지 이동도 URL 링크가 아니라 `onPageChange` 콜백으로 처리한다.
 */
export function JobPagination({ currentPage, totalPages, onPageChange }: JobPaginationProps) {
  const pages = buildPageItems(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-[8px]" aria-label="공고 목록 페이지">
      <PageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        ariaLabel="이전 페이지"
      >
        <Icon name="chevronRight" className="h-[24px] w-[12px] rotate-180" />
      </PageButton>

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex size-[36px] items-center justify-center text-[14px] leading-[1.5] font-bold tracking-[-0.14px] text-[#525252]"
          >
            …
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

      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        ariaLabel="다음 페이지"
      >
        <Icon name="chevronRight" className="h-[24px] w-[12px]" />
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
      className="flex size-[36px] items-center justify-center rounded-[8px] text-[#525252] disabled:opacity-40"
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
