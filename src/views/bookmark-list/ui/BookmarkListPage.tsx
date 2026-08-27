'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useBookmarkListQuery, useDeleteBookmarkMutation } from '@/entities/bookmark';
import { ApiError } from '@/shared/api';
import { BookmarkList, type BookmarkListStatus } from '@/widgets/bookmark-list';
import { SiteHeader } from '@/widgets/site-header';

import { mapBookmarkJobToListItem } from '../model/mapBookmarkJob';
import { BookmarkUnavailablePage } from './BookmarkUnavailablePage';

interface BookmarkListPageProps {
  initialPage?: number;
}

const PAGE_SIZE = 20;

export function BookmarkListPage({ initialPage = 0 }: BookmarkListPageProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [page, setPage] = useState(initialPage);
  const [removalErrorJobId, setRemovalErrorJobId] = useState<string | null>(null);

  const listQuery = useBookmarkListQuery({ page, size: PAGE_SIZE });
  const deleteBookmarkMutation = useDeleteBookmarkMutation();

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 0) params.set('page', String(page + 1));

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [page, pathname, router]);

  const status: BookmarkListStatus = listQuery.isLoading
    ? 'initialLoading'
    : listQuery.isFetching
      ? 'pageLoading'
      : listQuery.isError
        ? 'error'
        : (listQuery.data?.content.length ?? 0) === 0
          ? 'empty'
          : 'success';

  const jobs = (listQuery.data?.content ?? []).map(mapBookmarkJobToListItem);

  const handleRemoveBookmark = async (jobId: string) => {
    setRemovalErrorJobId(null);

    try {
      await deleteBookmarkMutation.mutateAsync(Number(jobId));
      if (jobs.length === 1 && page > 0) setPage(page - 1);
    } catch {
      setRemovalErrorJobId(jobId);
    }
  };

  if (listQuery.error instanceof ApiError && listQuery.error.code === 'FORBIDDEN') {
    return <BookmarkUnavailablePage />;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1312px] px-4 py-[40px]">
        <header>
          <h1 className="px-[4px] text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
            북마크
          </h1>
          <p className="mt-[8px] px-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
            저장한 공고를 한곳에서 확인해 보세요.
          </p>
        </header>

        <section className="mt-[32px]">
          <BookmarkList
            currentPage={page + 1}
            jobs={jobs}
            removalErrorJobId={removalErrorJobId}
            status={status}
            totalCount={listQuery.data?.totalElements ?? 0}
            totalPages={listQuery.data?.totalPages ?? 0}
            onPageChange={(nextPage) => setPage(nextPage - 1)}
            onRemoveBookmark={handleRemoveBookmark}
            onRetry={() => listQuery.refetch()}
          />
        </section>
      </main>
    </div>
  );
}
