import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icon } from '@/shared/ui/icon';

interface JobPaginationProps {
  currentPage: number;
  totalPages: number;
  /** 페이지 링크를 만들 기준 경로. 예: "/jobs" */
  basePath: string;
}

/**
 * 공고 목록 하단 페이지네이션.
 * 페이지 번호 클릭은 `basePath?page=N`으로 실제 이동한다.
 * 목업 데이터가 한 페이지 분량뿐이라 페이지를 옮겨도 카드 내용은 그대로다 — API 연동 이슈에서 실제 페이지별 데이터로 교체한다.
 */
export function JobPagination({ currentPage, totalPages, basePath }: JobPaginationProps) {
  const pages = buildPageItems(currentPage, totalPages);
  const hrefFor = (page: number) => `${basePath}?page=${page}`;

  return (
    <nav className="flex items-center justify-center gap-[8px]" aria-label="공고 목록 페이지">
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
  href: string;
  disabled: boolean;
  ariaLabel: string;
  children: ReactNode;
}

function PageLink({ href, disabled, ariaLabel, children }: PageLinkProps) {
  const className = 'flex size-[36px] items-center justify-center rounded-[8px] text-[#525252]';

  if (disabled) {
    return (
      <span aria-hidden="true" className={`${className} opacity-40`}>
        {children}
      </span>
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
