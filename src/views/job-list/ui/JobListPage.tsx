'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ADMIN_COMPANY_TYPE_LABEL } from '@/entities/company';
import {
  JOB_ROLE_LABEL,
  mapJobSummaryToListItem,
  useJobListQuery,
  type JobApplicationMethod,
  type JobCompanyType,
  type JobRole,
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
 * "모집 상태" 선택지 → `status` 파라미터. 서버는 PUBLISHED · CLOSED만 필터로 받는다. "마감
 * 임박"은 별도 상태 값이 아니라 "모집 중"과 같은 PUBLISHED에 마감일 오름차순 정렬을 더한
 * 것으로 본다(`sort`/`direction`은 아래에서 따로 계산, Issue #228).
 */
const STATUS_TO_PUBLIC_STATUS: Partial<Record<string, PublicJobStatus>> = {
  '모집 중': 'PUBLISHED',
  '마감 임박': 'PUBLISHED',
  마감: 'CLOSED',
};

/**
 * "기업 유형" 선택 상태·URL 쿼리에 저장된 값 → `companyType` 파라미터. 저장되는 값은 표시
 * 라벨이 아니라 `CompanyType` Enum 코드(`PUBLIC_ENTERPRISE` 등)다 — 라벨
 * (`ADMIN_COMPANY_TYPE_LABEL`)은 공식 문구가 정해지면 바뀔 값이라(Issue #121) 키로 쓰면
 * 문구가 바뀌는 순간 이미 공유된 필터 URL이 조용히 무효화된다. "출처"가 표시 이름이 아니라
 * `sourceCode`를 저장하는 것과 같은 이유다(PR #149 코드리뷰 반영). 표시용 라벨은
 * `JobFilterBar`가 코드로 역조회한다. 유효하지 않은 값이면 필터를 적용하지 않는다.
 */
function readCompanyType(value: string | undefined): JobCompanyType | undefined {
  return value !== undefined && value in ADMIN_COMPANY_TYPE_LABEL
    ? (value as JobCompanyType)
    : undefined;
}

/**
 * "직무" 선택 상태·URL 값 → `jobRole` 파라미터. "기업 유형"과 같은 이유로 저장되는 값은 표시
 * 라벨이 아니라 `JobRole` Enum 코드다(GETI-Server-V1 #326). 유효하지 않은 값이면 필터를 적용하지 않는다.
 */
function readJobRole(value: string | undefined): JobRole | undefined {
  return value !== undefined && value in JOB_ROLE_LABEL ? (value as JobRole) : undefined;
}

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
 * 검색어 · "마감 공고 포함" 토글 · "지원 유형"(→ `applicationMethod`) · "직무"(→ `jobRole`,
 * GETI-Server-V1 #326) · "모집 상태"(→ `status`) · "출처"(→ `sourceName`) · "기업 유형"
 * (→ `companyType`, Issue #228)이 모두 실제 조회에 연결돼 있다. "출처"는 표시 이름이 아니라
 * `sourceCode`(예: "SARAMIN")를 선택 상태 · URL에 그대로 저장한다 — 이름은 관리자가 자유 입력하는
 * 값이라 나중에 바뀌면 표시 이름 기반 URL은 조용히 무효화되지만, 안정적인 `sourceCode`는 그렇지
 * 않다(`JobFilterBar` 참고, GETI-Server-V1 #222, PR #149 코드리뷰 반영). "직무" · "기업 유형"도
 * 같은 이유로 표시 라벨이 아니라 `JobRole` · `CompanyType` Enum 코드를 선택 상태 · URL에
 * 저장한다(`readJobRole` · `readCompanyType`). "모집 상태"의 "마감 임박"은 별도 상태 값이 아니라
 * `status: 'PUBLISHED'` + `sort: 'DEADLINE', direction: 'ASC'` 조합으로 연결된다(Issue #228).
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

  /**
   * 페이지 초기화는 여기(디바운스 effect)가 아니라 `handleSearchInputChange`(실제 입력
   * 이벤트)에서 동기로 처리한다. isFirstRender 같은 ref로 "최초 실행만 건너뛰기"를
   * 흉내 내면 React Strict Mode(개발 환경, Next도 동일)가 effect를 setup→cleanup→setup으로
   * 한 번 더 실행할 때 첫 setup에서 ref가 이미 false로 바뀌어 있어 두 번째 setup이 그대로
   * 타이머를 등록해 버린다 — `initialSearchParams`로 복원한 page가 300ms 뒤 사라지는 문제가
   * 그대로 재현된다. 이 effect는 디바운스된 `searchQuery` 커밋만 담당해 실행 횟수와 무관하게
   * 안전하다(PR #132 코드리뷰 반영).
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    setPage(0);
  };

  const applicationMethod = selectedFilters.applyType
    ? APPLY_TYPE_TO_METHOD[selectedFilters.applyType]
    : undefined;
  const status = selectedFilters.status
    ? STATUS_TO_PUBLIC_STATUS[selectedFilters.status]
    : undefined;
  const isDeadlineSoonSelected = selectedFilters.status === '마감 임박';
  /** 선택 상태 · URL에 이미 `sourceCode`가 저장돼 있어 별도 조회 없이 그대로 쓸 수 있다(`JobFilterBar` 참고). */
  const sourceName = selectedFilters.source;
  const companyType = readCompanyType(selectedFilters.companyType);
  const jobRole = readJobRole(selectedFilters.job);

  /** 실제 목록 조회 파라미터로 변환된 필터만 센다. */
  const activeFilterCount = [applicationMethod, status, sourceName, companyType, jobRole].filter(
    Boolean,
  ).length;

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
    sourceName,
    companyType,
    jobRole,
    sort: isDeadlineSoonSelected ? 'DEADLINE' : undefined,
    direction: isDeadlineSoonSelected ? 'ASC' : undefined,
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
            onSearchQueryChange={handleSearchInputChange}
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
