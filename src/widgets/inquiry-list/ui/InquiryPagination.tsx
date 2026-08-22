import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icon } from '@/shared/ui/icon';

interface InquiryPaginationProps {
  basePath: string;
  currentPage: number;
  totalPages: number;
}

/** 내 문의 목록의 화면 페이지 번호를 `?page=N` 링크로 유지한다. */
export function InquiryPagination({ basePath, currentPage, totalPages }: InquiryPaginationProps) {
  const pages = buildPageItems(currentPage, totalPages);
  const hrefFor = (page: number) => `${basePath}?page=${page}`;

  return (
    <nav className="flex items-center justify-center gap-[8px]" aria-label="문의 목록 페이지">
      <PageLink
        href={hrefFor(currentPage - 1)}
        disabled={currentPage === 1}
        ariaLabel="이전 페이지"
      >
        <Icon name="chevronRight" className="h-[24px] w-[12px] rotate-180" />
      </PageLink>

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex size-[36px] items-center justify-center text-[14px] leading-[1.5] font-bold tracking-[-0.14px] text-[#525252]"
          >
            …
          </span>
        ) : (
          <Link
            key={page}
            href={hrefFor(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`flex size-[36px] items-center justify-center rounded-[8px] text-[14px] leading-[1.5] font-bold tracking-[-0.14px] ${
              page === currentPage ? 'bg-[#17627a] text-white' : 'text-[#111]'
            }`}
          >
            {page}
          </Link>
        ),
      )}

      <PageLink
        href={hrefFor(currentPage + 1)}
        disabled={currentPage === totalPages}
        ariaLabel="다음 페이지"
      >
        <Icon name="chevronRight" className="h-[24px] w-[12px]" />
      </PageLink>
    </nav>
  );
}

interface PageLinkProps {
  ariaLabel: string;
  children: ReactNode;
  disabled: boolean;
  href: string;
}

function PageLink({ ariaLabel, children, disabled, href }: PageLinkProps) {
  const className = 'flex size-[36px] items-center justify-center rounded-[8px] text-[#525252]';

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-label={ariaLabel}
        className={`${className} cursor-not-allowed opacity-40`}
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href} aria-label={ariaLabel} className={className}>
      {children}
    </Link>
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
