'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  mapJobSummaryToListItem,
  useJobListQuery,
  type JobApplicationMethod,
  type PublicJobStatus,
} from '@/entities/job';
import { JobList, type FilterKey, type JobListStatus } from '@/widgets/job-list';
import { SiteHeader } from '@/widgets/site-header';

const PAGE_SIZE = 20;
/** 검색어 입력마다 요청을 보내지 않도록 두는 최소한의 디바운스(ms). */
const SEARCH_DEBOUNCE_MS = 300;

const FILTER_KEYS: FilterKey[] = ['applyType', 'job', 'companyType', 'source', 'status'];

/** "지원 유형" 선택지 → `applicationMethod` 파라미터. 1:1로 대응해 확정적으로 연결할 수 있다. */
const APPLY_TYPE_TO_METHOD: Partial<Record<string, JobApplicationMethod>> = {
  '외부 지원': 'EXTERNAL',
  '학교 지원': 'INTERNAL',
};

/**
 * "모집 상태" 선택지 → `status` 파라미터. 서버는 PUBLISHED · CLOSED만 필터로 받는다 — "마감
 * 임박"은 대응하는 상태 값이 없어 매핑하지 않는다(선택은 되지만 조회에는 반영되지 않는다,
 * PR #132 코드리뷰 반영).
 */
const STATUS_TO_PUBLIC_STATUS: Partial<Record<string, PublicJobStatus>> = {
  '모집 중': 'PUBLISHED',
  마감: 'CLOSED',
};

export interface JobListSearchParams {
  q?: string;
  page?: string;
  closed?: string;
  applyType?: string;
  job?: string;
  companyType?: string;
  source?: string;
  status?: string;
}

function readSelectedFilters(
  params: JobListSearchParams | undefined,
): Partial<Record<FilterKey, string>> {
  const selected: Partial<Record<FilterKey, string>> = {};
  for (const key of FILTER_KEYS) {
    const value = params?.[key];
    if (value) selected[key] = value;
  }
  return selected;
}

interface JobListPageProps {
  /**
   * `app/jobs/page.tsx`(Server Component)가 넘겨주는 초기 URL 쿼리스트링. 이 화면은 `'use
   * client'`라 `useSearchParams()`로 직접 읽을 수도 있지만, 그러면 Next가 이 라우트 전체를
   * Suspense 경계로 감싸야 한다 — `AdminApplicantPage`(admin/applicants)와 같은 패턴으로,
   * 최초 값은 Server Component에서 Prop으로 받고 이후 변경만 `router.replace`로 반영한다.
   */
  initialSearchParams?: JobListSearchParams;
}

/**
 * 채용 공고 목록 화면. `GET /api/v1/jobs`(entities/job의 `useJobListQuery`)로 실제 데이터를
 * 불러온다(Issue #122). 인증이 필요한 API라 다른 어드민 화면과 동일하게 클라이언트에서 조회한다.
 *
 * 검색어 · "마감 공고 포함" 토글 · "지원 유형"(→ `applicationMethod`) · "모집 상태"(→ `status`,
 * "마감 임박" 제외)가 실제 조회에 연결돼 있다. "직무" · "기업 유형" · "출처"는 선택 UI만
 * 동작하고 조회에는 반영되지 않는다 — "직무"는 대응 API 파라미터가 아예 없고, "기업 유형"은
 * Figma 라벨이 백엔드 `CompanyType` Enum과 대응하지 않으며, "출처"는 서버 `sourceName` 필터가
 * `jobs.source_name`(수집원 코드, 예: "SARAMIN")과 정확히 일치해야 하는데 공개 출처 목록
 * API(`GET /api/v1/job-sources`)는 표시용 한글 이름만 내려주고 그 코드를 노출하지 않아 실제
 * 값을 확정할 수 없다(`JobFilterBar` 참고, PR #132 코드리뷰 참고 사항으로 남김).
 *
 * 검색 · 필터 · 페이지 상태는 새로고침 · 뒤로가기에도 유지되도록 URL 쿼리스트링과 동기화한다
 * (새 라이브러리 없이 Next `router`/Server Component `searchParams` 범위에서 처리, PR #132
 * 코드리뷰 반영).
 */
export function JobListPage({ initialSearchParams }: JobListPageProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [page, setPage] = useState(() => {
    const raw = Number(initialSearchParams?.page);
    return Number.isInteger(raw) && raw > 1 ? raw - 1 : 0;
  });
  const [searchInput, setSearchInput] = useState(() => initialSearchParams?.q ?? '');
  const [searchQuery, setSearchQuery] = useState(() => initialSearchParams?.q ?? '');
  const [includeClosed, setIncludeClosed] = useState(() => initialSearchParams?.closed !== '0');
  const [selectedFilters, setSelectedFilters] = useState<Partial<Record<FilterKey, string>>>(() =>
    readSelectedFilters(initialSearchParams),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const applicationMethod = selectedFilters.applyType
    ? APPLY_TYPE_TO_METHOD[selectedFilters.applyType]
    : undefined;
  const status = selectedFilters.status
    ? STATUS_TO_PUBLIC_STATUS[selectedFilters.status]
    : undefined;

  /** 실제 목록 조회 파라미터로 변환된 필터만 센다 — 직무 · 기업 유형 · 출처, "마감 임박"은 제외. */
  const activeFilterCount = [applicationMethod, status].filter(Boolean).length;

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (!includeClosed) params.set('closed', '0');
    if (page > 0) params.set('page', String(page + 1));
    for (const key of FILTER_KEYS) {
      const value = selectedFilters[key];
      if (value) params.set(key, value);
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [searchQuery, includeClosed, page, selectedFilters, pathname, router]);

  const handleIncludeClosedChange = (next: boolean) => {
    setIncludeClosed(next);
    setPage(0);
  };

  const handleSelectedFiltersChange = (next: Partial<Record<FilterKey, string>>) => {
    setSelectedFilters(next);
    setPage(0);
  };

  const listQuery = useJobListQuery({
    page,
    size: PAGE_SIZE,
    query: searchQuery.trim() || undefined,
    openOnly: !includeClosed,
    applicationMethod,
    status,
  });

  const listStatus: JobListStatus = listQuery.isLoading
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
            status={listStatus}
            jobs={jobs}
            totalCount={listQuery.data?.totalElements ?? 0}
            currentPage={page + 1}
            totalPages={listQuery.data?.totalPages ?? 0}
            onPageChange={(nextPage) => setPage(nextPage - 1)}
            searchQuery={searchInput}
            onSearchQueryChange={setSearchInput}
            includeClosed={includeClosed}
            onIncludeClosedChange={handleIncludeClosedChange}
            selectedFilters={selectedFilters}
            onSelectedFiltersChange={handleSelectedFiltersChange}
            activeFilterCount={activeFilterCount}
            onRetry={() => listQuery.refetch()}
          />
        </div>
      </main>
    </div>
  );
}
