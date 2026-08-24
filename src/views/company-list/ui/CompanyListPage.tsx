'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { mapCompanyListItem, useCompanyListQuery, type AdminCompanyType } from '@/entities/company';
import { CompanyList, type CompanyListStatus } from '@/widgets/company-list';
import { SiteHeader } from '@/widgets/site-header';

const PAGE_SIZE = 20;
/** 검색어 입력마다 요청을 보내지 않도록 두는 최소한의 디바운스(ms). `job-list`와 동일한 값. */
const SEARCH_DEBOUNCE_MS = 300;

export interface CompanyListSearchParams {
  q?: string;
  page?: string;
  companyType?: string;
}

interface CompanyListPageProps {
  /**
   * `app/companies/page.tsx`(Server Component)가 넘겨주는 초기 URL 쿼리스트링.
   * `views/job-list`의 `JobListPage`와 같은 이유로 최초 값은 Prop으로 받고, 이후 변경만
   * `router.replace`로 반영한다.
   */
  initialSearchParams?: CompanyListSearchParams;
}

/**
 * 기업 목록(기업 정보) 화면. `GET /api/v1/companies`(`entities/company`의 `useCompanyListQuery`)로
 * 실제 데이터를 불러온다(Issue #156). 학생 · 교사 · 개발자 로그인이면 누구나 호출 가능한 API다.
 *
 * 검색어와 기업 유형 필터가 실제 조회에 연결된다. "규모" 배지 · "채용 중인 공고" 수는
 * 대응하는 서버 데이터가 없어 이번 범위에서 뺐다(`entities/company/ui/CompanyCard` 참고).
 *
 * 검색 · 필터 · 페이지 상태는 새로고침 · 뒤로가기에도 유지되도록 URL 쿼리스트링과 동기화한다
 * (`JobListPage`와 동일한 패턴).
 */
export function CompanyListPage({ initialSearchParams }: CompanyListPageProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [page, setPage] = useState(() => {
    const raw = Number(initialSearchParams?.page);
    return Number.isInteger(raw) && raw > 1 ? raw - 1 : 0;
  });
  const [searchInput, setSearchInput] = useState(() => initialSearchParams?.q ?? '');
  const [searchQuery, setSearchQuery] = useState(() => initialSearchParams?.q ?? '');
  const [companyType, setCompanyType] = useState<AdminCompanyType | ''>(
    () => (initialSearchParams?.companyType as AdminCompanyType | undefined) ?? '',
  );

  /** 디바운스된 검색어 커밋만 담당한다 — 페이지 초기화는 입력 이벤트(`handleSearchInputChange`)에서 동기로 처리한다(`JobListPage` 참고). */
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

  const handleCompanyTypeChange = (value: AdminCompanyType | '') => {
    setCompanyType(value);
    setPage(0);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (page > 0) params.set('page', String(page + 1));
    if (companyType) params.set('companyType', companyType);

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [searchQuery, page, companyType, pathname, router]);

  const listQuery = useCompanyListQuery({
    page,
    size: PAGE_SIZE,
    query: searchQuery.trim() || undefined,
    companyType: companyType || undefined,
  });

  const listStatus: CompanyListStatus = listQuery.isLoading
    ? 'initialLoading'
    : listQuery.isFetching
      ? 'pageLoading'
      : listQuery.isError
        ? 'error'
        : (listQuery.data?.content.length ?? 0) === 0
          ? 'empty'
          : 'success';

  const companies = (listQuery.data?.content ?? []).map(mapCompanyListItem);

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <SiteHeader activeNav="기업 정보" />

      <main className="mx-auto max-w-[1280px] px-4 py-10">
        <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
          기업 정보
        </h1>
        <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
          다양한 기업의 정보와 채용 중인 공고를 확인해 보세요.
        </p>

        <div className="mt-8">
          <CompanyList
            status={listStatus}
            companies={companies}
            totalCount={listQuery.data?.totalElements ?? 0}
            currentPage={page + 1}
            totalPages={listQuery.data?.totalPages ?? 0}
            onPageChange={(nextPage) => setPage(nextPage - 1)}
            query={searchInput}
            onQueryChange={handleSearchInputChange}
            companyType={companyType}
            onCompanyTypeChange={handleCompanyTypeChange}
            onRetry={() => listQuery.refetch()}
          />
        </div>
      </main>
    </div>
  );
}
