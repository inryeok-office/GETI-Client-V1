'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  useAdminJobListQuery,
  useChangeAdminJobStatusMutation,
  type AdminJobStatus,
  type AdminJobSummary,
} from '@/entities/job';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { DropdownField, type DropdownOption } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';
import { PageState } from '@/shared/ui/page-state';
import { AppToaster, showToast } from '@/shared/ui/toast';
import { AdminJobTable } from '@/widgets/admin-job-table';

/**
 * Server Component(`app/(admin)/admin/jobs/page.tsx`)가 넘겨주는 초기 URL 쿼리스트링.
 * `AdminApplicantSearchParams`와 같은 패턴이다.
 */
export interface AdminJobListSearchParams {
  q?: string;
  page?: string;
  /** 공고 상태 필터. `AdminJobStatus` 값(DRAFT·PUBLISHED·CLOSED·DELETED). */
  status?: string;
}

interface AdminJobListPageProps {
  initialSearchParams?: AdminJobListSearchParams;
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const STATUS_VALUES: AdminJobStatus[] = ['DRAFT', 'PUBLISHED', 'CLOSED', 'DELETED'];

const STATUS_OPTIONS: readonly DropdownOption[] = [
  { label: '전체', value: '' },
  { label: '임시저장', value: 'DRAFT' },
  { label: '게시', value: 'PUBLISHED' },
  { label: '마감', value: 'CLOSED' },
  { label: '삭제', value: 'DELETED' },
];

function parseStatus(value?: string): AdminJobStatus | '' {
  return value && (STATUS_VALUES as string[]).includes(value) ? (value as AdminJobStatus) : '';
}

function buildSearchParams(state: {
  searchQuery: string;
  status: AdminJobStatus | '';
  page: number;
}): URLSearchParams {
  const params = new URLSearchParams();
  if (state.searchQuery) params.set('q', state.searchQuery);
  if (state.status) params.set('status', state.status);
  if (state.page > 0) params.set('page', String(state.page + 1));
  return params;
}

/**
 * 어드민 공고 관리 목록 화면(`/admin/jobs`). `GET /api/v1/admin/jobs`(관리자 전용, GETI-Server-V1
 * #304)로 목록을 불러온다 — 공개 검색과 달리 임시저장(DRAFT)·삭제(DELETED)까지 나오고, "공고 상태"
 * 필터로 상태별 조회가 된다. 담당자 정보는 이 응답에도 없어 "ㅡ"로 표시한다.
 * 공고명을 누르면 `/admin/jobs/[jobId]` 상세로, "공고 등록"은 `/admin/jobs/new`,
 * 표의 "수정"은 `/admin/jobs/[jobId]/edit`로 이동한다.
 * "마감"·"삭제"는 이 화면이 상태 변경 API에 연동한다 — 뮤테이션·확인 모달·토스터를 여기서 소유해,
 * 마지막 공고를 삭제해 목록이 빈 상태로 바뀌어도 성공 토스트가 유지된다(PR #208 코드리뷰 반영).
 * 검색·필터·페이지는 URL 쿼리스트링과 동기화한다. 간격·색상은 Figma(node 586:12549)를 옮겼다.
 */
export function AdminJobListPage({ initialSearchParams }: AdminJobListPageProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchInput, setSearchInput] = useState(() => initialSearchParams?.q ?? '');
  const [searchQuery, setSearchQuery] = useState(() => initialSearchParams?.q ?? '');
  const [status, setStatus] = useState<AdminJobStatus | ''>(() =>
    parseStatus(initialSearchParams?.status),
  );
  const [page, setPage] = useState(() => {
    const raw = Number(initialSearchParams?.page);
    return Number.isInteger(raw) && raw > 1 ? raw - 1 : 0;
  });

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const listQuery = useAdminJobListQuery({
    page,
    size: PAGE_SIZE,
    query: searchQuery.trim() || undefined,
    status: status || undefined,
  });

  const statusMutation = useChangeAdminJobStatusMutation();
  const [deleteTarget, setDeleteTarget] = useState<AdminJobSummary | null>(null);

  /**
   * URL의 `page`는 상한이 없어 `?page=999`나 데이터 감소로 현재 페이지가 사라지면 빈 응답이 온다.
   * 새 응답의 `totalPages`를 알게 되면 렌더 중에 마지막 유효 페이지로 잘라 다시 렌더한다(PR #203
   * 코드리뷰 반영). `keepPreviousData`로 조건이 바뀐 직후 오는 이전 응답(placeholder)의 작은
   * `totalPages`로 새 URL의 유효 page를 덮어쓰지 않도록, placeholder인 동안은 보정하지 않는다.
   */
  const maxPage =
    listQuery.data && !listQuery.isPlaceholderData
      ? Math.max(0, listQuery.data.totalPages - 1)
      : Number.POSITIVE_INFINITY;
  if (page > maxPage) {
    setPage(maxPage);
  }

  const filterQueryString = buildSearchParams({ searchQuery, status, page }).toString();

  useEffect(() => {
    const queryString = buildSearchParams({ searchQuery, status, page }).toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [searchQuery, status, page, pathname, router]);

  const isTransitioning = listQuery.isFetching && listQuery.isPlaceholderData;
  const jobs = listQuery.data?.content ?? [];
  const totalCount = listQuery.data?.totalElements ?? 0;
  const hasActiveFilters = Boolean(searchQuery.trim() || status);

  function handleSearchInputChange(value: string) {
    setSearchInput(value);
    setPage(0);
  }

  function handleStatusChange(value: string) {
    setStatus(parseStatus(value));
    setPage(0);
  }

  function handleCloseJob(job: AdminJobSummary) {
    statusMutation.mutate(
      { jobId: job.jobId, status: 'CLOSED' },
      {
        onSuccess: () =>
          showToast({ tone: 'success', message: `"${job.title}" 공고를 마감했습니다.` }),
        onError: (error) => showToast({ tone: 'error', message: error.message }),
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const job = deleteTarget;

    statusMutation.mutate(
      { jobId: job.jobId, status: 'DELETED' },
      {
        onSuccess: () => {
          setDeleteTarget(null);
          showToast({ tone: 'success', message: `"${job.title}" 공고를 삭제했습니다.` });
        },
        onError: (error) => showToast({ tone: 'error', message: error.message }),
      },
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppToaster />
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
              placeholder="공고명으로 검색해 보세요."
              aria-label="공고 검색"
              className="min-w-0 flex-1 text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-600"
            />
          </label>

          <DropdownField
            ariaLabel="공고 상태 필터"
            placeholder="공고 상태"
            options={STATUS_OPTIONS}
            value={status}
            onChange={handleStatusChange}
            controlClassName="h-[56px]"
            className="w-[232px] shrink-0"
          />

          <Link
            href="/admin/jobs/new"
            className="bg-primary-700 flex h-[56px] shrink-0 items-center gap-[8px] rounded-[8px] px-[32px] py-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
          >
            <Icon name="plus" className="size-[20px]" />
            공고 등록
          </Link>
        </div>

        {listQuery.isLoading || isTransitioning ? (
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
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-[16px] rounded-[8px] border border-neutral-200 bg-white">
            <PageState
              variant="empty"
              title={hasActiveFilters ? '조건에 맞는 공고가 없습니다.' : '등록된 공고가 없습니다.'}
              description={
                hasActiveFilters ? '검색어나 필터를 바꿔 보세요.' : '등록된 공고가 아직 없습니다.'
              }
            />
            {page > 0 && (
              <button
                type="button"
                onClick={() => setPage(0)}
                className="rounded-[8px] border border-neutral-200 px-[24px] py-[12px] text-[14px] leading-[1.4] tracking-[-0.14px] text-neutral-700"
              >
                첫 페이지로
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-[24px]">
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-900">
              총 {totalCount}개 공고
            </p>

            <AdminJobTable
              jobs={jobs}
              queryString={filterQueryString}
              isMutating={statusMutation.isPending}
              onCloseJob={handleCloseJob}
              onDeleteJob={setDeleteTarget}
            />

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

      <Dialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="공고 삭제"
        panelClassName="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-lg"
        actions={
          <>
            <Button variant="neutral" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button
              variant="dangerOutline"
              isLoading={statusMutation.isPending}
              onClick={handleDeleteConfirm}
            >
              삭제
            </Button>
          </>
        }
      >
        {deleteTarget && (
          <>
            {deleteTarget.title} 공고를 삭제하시겠습니까?
            <br />
            기존 지원·북마크 이력은 보존됩니다.
          </>
        )}
      </Dialog>
    </div>
  );
}
