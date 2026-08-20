'use client';

import { useEffect, useState } from 'react';

import { mapJobSummaryToListItem, useJobListQuery } from '@/entities/job';
import { JobList, type JobListStatus } from '@/widgets/job-list';
import { SiteHeader } from '@/widgets/site-header';

const PAGE_SIZE = 20;
/** 검색어 입력마다 요청을 보내지 않도록 두는 최소한의 디바운스(ms). */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * 채용 공고 목록 화면. `GET /api/v1/jobs`(entities/job의 `useJobListQuery`)로 실제 데이터를
 * 불러온다(Issue #122). 인증이 필요한 API라 다른 어드민 화면과 동일하게 클라이언트에서 조회한다.
 * 검색어 · "마감 공고 포함" 토글만 실제 조회에 연결돼 있다 — 나머지 5개 드롭다운 필터는
 * 대응하는 API 파라미터가 없거나(직무) 실제 값을 확인하지 못해(기업 유형 · 출처 · 모집 상태)
 * 선택 UI만 동작하는 로컬 상태로 남아 있다(`JobFilterSection` 참고).
 */
export function JobListPage() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [includeClosed, setIncludeClosed] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleIncludeClosedChange = (next: boolean) => {
    setIncludeClosed(next);
    setPage(0);
  };

  const listQuery = useJobListQuery({
    page,
    size: PAGE_SIZE,
    query: searchQuery.trim() || undefined,
    openOnly: !includeClosed,
  });

  const status: JobListStatus = listQuery.isLoading
    ? 'initialLoading'
    : listQuery.isFetching
      ? 'pageLoading'
      : listQuery.isError
        ? 'error'
        : (listQuery.data?.content.length ?? 0) === 0
          ? 'empty'
          : 'success';

  const jobs = (listQuery.data?.content ?? []).map(mapJobSummaryToListItem);

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <SiteHeader activeNav="채용 공고" />

      <main className="mx-auto max-w-[1280px] px-4 py-[40px]">
        <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
          채용 공고
        </h1>
        <p className="mt-[8px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
          다양한 채용 정보를 한곳에서 확인하고 나에게 맞는 공고를 찾아보세요.
        </p>

        <div className="mt-[32px]">
          <JobList
            status={status}
            jobs={jobs}
            totalCount={listQuery.data?.totalElements ?? 0}
            currentPage={page + 1}
            totalPages={listQuery.data?.totalPages ?? 0}
            onPageChange={(nextPage) => setPage(nextPage - 1)}
            searchQuery={searchInput}
            onSearchQueryChange={setSearchInput}
            includeClosed={includeClosed}
            onIncludeClosedChange={handleIncludeClosedChange}
            onRetry={() => listQuery.refetch()}
          />
        </div>
      </main>
    </div>
  );
}
