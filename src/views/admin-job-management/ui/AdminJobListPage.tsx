'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useJobListQuery, type PublicJobStatus } from '@/entities/job';
import { DropdownField, type DropdownOption } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';
import { PageState } from '@/shared/ui/page-state';
import { AdminJobTable } from '@/widgets/admin-job-table';

/**
 * Server Component(`app/(admin)/admin/jobs/page.tsx`)가 넘겨주는 초기 URL 쿼리스트링.
 * `AdminApplicantSearchParams`와 같은 패턴이다.
 */
export interface AdminJobListSearchParams {
  q?: string;
  page?: string;
  /** 마감 상태 필터. 'open' → 모집 중(PUBLISHED), 'closed' → 마감(CLOSED). */
  deadline?: string;
}

interface AdminJobListPageProps {
  initialSearchParams?: AdminJobListSearchParams;
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * "마감 상태" 필터 값 → `GET /api/v1/jobs`의 `status` 파라미터.
 * 어드민 전용 목록 API가 없어 공개 검색 API를 그대로 쓴다 — 임시저장(DRAFT)·삭제(DELETED)
 * 공고는 이 API로 조회되지 않는다. Figma에는 "공개 상태" 필터도 있으나, 이 API로는 모든 결과가
 * "공개"라 무의미해 이번 범위에서는 넣지 않는다(어드민 목록 API가 생기면 추가, Issue #202).
 */
const DEADLINE_TO_STATUS: Record<string, PublicJobStatus | undefined> = {
  open: 'PUBLISHED',
  closed: 'CLOSED',
};

const DEADLINE_OPTIONS: readonly DropdownOption[] = [
  { label: '전체', value: '' },
  { label: '모집 중', value: 'open' },
  { label: '마감', value: 'closed' },
];

function parseDeadline(value?: string): string {
  return value === 'open' || value === 'closed' ? value : '';
}

function buildSearchParams(state: {
  searchQuery: string;
  deadline: string;
  page: number;
}): URLSearchParams {
  const params = new URLSearchParams();
  if (state.searchQuery) params.set('q', state.searchQuery);
  if (state.deadline) params.set('deadline', state.deadline);
  if (state.page > 0) params.set('page', String(state.page + 1));
  return params;
}

/**
 * 어드민 공고 관리 목록 화면(`/admin/jobs`). `GET /api/v1/jobs`(공개 검색 API)로 목록을 불러온다 —
 * 어드민 전용 공고 목록 API가 없어 게시(PUBLISHED)·마감(CLOSED) 공고만 나오고, 담당자 정보도
 * 응답에 없어 "ㅡ"로 표시한다(Issue #202). 공고명을 누르면 `/admin/jobs/[jobId]` 상세로 간다.
 * 등록·수정·마감·삭제 액션은 이번 범위 밖이라 "공고 등록" 버튼과 표의 관리 텍스트는 비활성이다.
 * 검색·필터·페이지는 URL 쿼리스트링과 동기화한다(`AdminApplicantPage`와 동일).
 * 간격·색상은 Figma(node 586:12549)를 옮겼다.
 */
export function AdminJobListPage({ initialSearchParams }: AdminJobListPageProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchInput, setSearchInput] = useState(() => initialSearchParams?.q ?? '');
  const [searchQuery, setSearchQuery] = useState(() => initialSearchParams?.q ?? '');
  const [deadline, setDeadline] = useState(() => parseDeadline(initialSearchParams?.deadline));
  const [page, setPage] = useState(() => {
    const raw = Number(initialSearchParams?.page);
    return Number.isInteger(raw) && raw > 1 ? raw - 1 : 0;
  });

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filterQueryString = buildSearchParams({ searchQuery, deadline, page }).toString();

  useEffect(() => {
    const queryString = buildSearchParams({ searchQuery, deadline, page }).toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [searchQuery, deadline, page, pathname, router]);

  const listQuery = useJobListQuery({
    page,
    size: PAGE_SIZE,
    query: searchQuery.trim() || undefined,
    status: DEADLINE_TO_STATUS[deadline],
  });

  const jobs = listQuery.data?.content ?? [];
  const totalCount = listQuery.data?.totalElements ?? 0;
  const hasActiveFilters = Boolean(searchQuery.trim() || deadline);

  function handleSearchInputChange(value: string) {
    setSearchInput(value);
    setPage(0);
  }

  function handleDeadlineChange(value: string) {
    setDeadline(value);
    setPage(0);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex h-[80px] items-center justify-between border-b border-neutral-200 bg-white px-[40px]">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-900">공고 관리</p>
        <div className="flex items-center gap-[12px]">
          <span className="bg-primary-100 size-[32px] rounded-full" aria-hidden="true" />
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-600">
            개발자 · 외 1개
          </p>
          <Icon name="chevronRight" className="h-[12px] w-[24px] rotate-90 text-neutral-600" />
        </div>
      </header>

      <main className="flex flex-col gap-[24px] px-[40px] py-[40px]">
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
            공고 관리
          </h1>
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-700">
            등록된 공고의 공개 상태와 마감 상태를 관리합니다.
          </p>
        </div>

        <div className="flex items-start gap-[20px]">
          <label className="flex h-[56px] flex-1 items-center gap-[16px] rounded-[8px] border border-neutral-200 bg-white py-[8px] pr-[8px] pl-[16px]">
            <Icon name="search" className="size-[20px] shrink-0 text-neutral-600" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => handleSearchInputChange(event.target.value)}
              placeholder="공고명 또는 기업명으로 검색해 보세요."
              aria-label="공고 검색"
              className="min-w-0 flex-1 text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-600"
            />
          </label>

          <DropdownField
            ariaLabel="마감 상태 필터"
            placeholder="마감 상태"
            options={DEADLINE_OPTIONS}
            value={deadline}
            onChange={handleDeadlineChange}
            controlClassName="h-[56px]"
            className="w-[232px] shrink-0"
          />

          <button
            type="button"
            disabled
            title="공고 등록은 준비 중입니다."
            className="bg-primary-700 flex h-[56px] shrink-0 cursor-not-allowed items-center gap-[8px] rounded-[8px] px-[32px] py-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white opacity-50"
          >
            <Icon name="plus" className="size-[20px]" />
            공고 등록
          </button>
        </div>

        {listQuery.isLoading ? (
          <div className="min-h-[360px] rounded-[8px] border border-neutral-200 bg-white">
            <PageState
              variant="loading"
              title="공고 목록을 불러오는 중입니다."
              description="잠시만 기다려 주세요."
            />
          </div>
        ) : listQuery.isError ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-[16px] rounded-[8px] border border-neutral-200 bg-white">
            <PageState
              variant="error"
              title="공고 목록을 불러오지 못했습니다."
              description="잠시 후 다시 시도해 주세요."
            />
            <button
              type="button"
              onClick={() => listQuery.refetch()}
              className="bg-primary-700 rounded-[8px] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
            >
              다시 시도
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="min-h-[360px] rounded-[8px] border border-neutral-200 bg-white">
            <PageState
              variant="empty"
              title={hasActiveFilters ? '조건에 맞는 공고가 없습니다.' : '등록된 공고가 없습니다.'}
              description={
                hasActiveFilters
                  ? '검색어나 필터를 바꿔 보세요.'
                  : '게시되었거나 마감된 공고가 아직 없습니다.'
              }
            />
          </div>
        ) : (
          <div className="flex flex-col gap-[24px]">
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-900">
              총 {totalCount}개 공고
            </p>

            <AdminJobTable jobs={jobs} queryString={filterQueryString} />

            {listQuery.data && listQuery.data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-[12px]">
                <button
                  type="button"
                  disabled={listQuery.data.first}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-[8px] border border-neutral-200 px-[16px] py-[8px] text-[14px] leading-[1.4] tracking-[-0.14px] text-neutral-700 disabled:opacity-40"
                >
                  이전
                </button>
                <p className="text-[14px] leading-[1.4] tracking-[-0.14px] text-neutral-700">
                  {page + 1} / {listQuery.data.totalPages}
                </p>
                <button
                  type="button"
                  disabled={listQuery.data.last}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-[8px] border border-neutral-200 px-[16px] py-[8px] text-[14px] leading-[1.4] tracking-[-0.14px] text-neutral-700 disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
