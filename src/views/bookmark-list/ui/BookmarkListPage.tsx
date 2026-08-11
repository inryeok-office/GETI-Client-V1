import { SiteHeader } from '@/widgets/site-header';
import { BookmarkList, type BookmarkListStatus } from '@/widgets/bookmark-list';

import { MOCK_BOOKMARKED_JOBS } from '../model/mock';
import { BookmarkUnavailablePage } from './BookmarkUnavailablePage';

interface BookmarkListPageProps {
  searchParams: Promise<{ variant?: string }>;
}

const STATUS_BY_VARIANT: Record<string, BookmarkListStatus> = {
  empty: 'empty',
  error: 'error',
  loading: 'loading',
};

export async function BookmarkListPage({ searchParams }: BookmarkListPageProps) {
  const { variant } = await searchParams;

  if (variant === 'unavailable') return <BookmarkUnavailablePage />;

  const status = STATUS_BY_VARIANT[variant ?? 'success'] ?? 'success';
  const isRemovalError = variant === 'remove-error';
  const jobs = status === 'empty' ? [] : MOCK_BOOKMARKED_JOBS;

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
            initialJobs={jobs}
            initialRemovalErrorJobId={isRemovalError ? 'bookmark-3' : null}
            mockRemovalResult={isRemovalError ? 'error' : 'success'}
            status={status}
          />
        </section>
      </main>
    </div>
  );
}
