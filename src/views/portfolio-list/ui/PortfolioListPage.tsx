'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  mapPortfolioRequestSummaryToListItem,
  type PortfolioRequestSummaryApiResponse,
  useAllPortfolioRequestListQuery,
} from '@/entities/portfolio-request';
import {
  PortfolioRequestList,
  type PortfolioRequestListFilter,
  type PortfolioRequestListStatus,
} from '@/widgets/portfolio-request-list';
import { SiteHeader } from '@/widgets/site-header';

interface PortfolioListPageProps {
  initialFilter?: string;
  initialPage?: number;
}

const PAGE_SIZE = 20;

const FILTER_BY_QUERY: Record<string, PortfolioRequestListFilter> = {
  all: 'ALL',
  closed: 'CLOSED',
  required: 'REQUIRED',
};

export function PortfolioListPage({
  initialFilter = 'all',
  initialPage = 0,
}: PortfolioListPageProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [filter, setFilter] = useState<PortfolioRequestListFilter>(
    FILTER_BY_QUERY[initialFilter] ?? 'ALL',
  );
  const [page, setPage] = useState(initialPage);
  const [now, setNow] = useState(() => Date.now());

  const listQuery = useAllPortfolioRequestListQuery(PAGE_SIZE);

  useEffect(() => {
    const nextDueAt = findNextPublishedDueAt(listQuery.data ?? [], now);
    if (nextDueAt === null) return;

    const timeoutId = window.setTimeout(
      () => setNow(Date.now()),
      Math.min(nextDueAt - now + 1, 2_147_483_647),
    );

    return () => window.clearTimeout(timeoutId);
  }, [listQuery.data, now]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== 'ALL') params.set('filter', filter.toLowerCase());
    if (page > 0) params.set('page', String(page + 1));

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [filter, page, pathname, router]);

  const allRequests = (listQuery.data ?? []).map(mapPortfolioRequestSummaryToListItem);
  const filteredRequests =
    filter === 'ALL' ? allRequests : allRequests.filter((request) => request.status === filter);
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const requests = filteredRequests.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const status: PortfolioRequestListStatus = listQuery.isLoading
    ? 'loading'
    : listQuery.isError
      ? 'error'
      : allRequests.length === 0
        ? 'empty'
        : 'success';

  const handleFilterChange = (nextFilter: PortfolioRequestListFilter) => {
    setFilter(nextFilter);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader activeNav="포트폴리오" />
      <main className="mx-auto w-full max-w-[1312px] px-4 pt-10 pb-[120px]">
        <header>
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
            포트폴리오 제출
          </h1>
          <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
            학교에서 요청한 포트폴리오 제출 내역을 확인하고 제출할 수 있어요.
          </p>
        </header>

        <div className="mt-8">
          <PortfolioRequestList
            currentFilter={filter}
            currentPage={page + 1}
            hasRequests={allRequests.length > 0}
            requests={requests}
            status={status}
            totalPages={totalPages}
            onFilterChange={handleFilterChange}
            onPageChange={(nextPage) => setPage(nextPage - 1)}
            onRetry={() => listQuery.refetch()}
          />
        </div>
      </main>
    </div>
  );
}

function findNextPublishedDueAt(requests: PortfolioRequestSummaryApiResponse[], now: number) {
  const nextDueAt = requests.reduce<number | null>((nearestDueAt, request) => {
    if (request.status !== 'PUBLISHED') return nearestDueAt;

    const dueAt = new Date(request.dueAt).getTime();
    if (Number.isNaN(dueAt) || dueAt < now) return nearestDueAt;

    return nearestDueAt === null || dueAt < nearestDueAt ? dueAt : nearestDueAt;
  }, null);

  return nextDueAt;
}
