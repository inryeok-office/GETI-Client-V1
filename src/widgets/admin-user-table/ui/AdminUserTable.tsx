'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  ADMIN_MEMBER_DEPARTMENTS,
  ADMIN_MEMBER_ROLES,
  ADMIN_MEMBER_STATUSES,
  useAdminMemberDetailQuery,
  useAdminMemberListQuery,
  useMyProfileQuery,
  type AdminMemberRole,
  type AdminMemberStatus,
  type AdminMemberSummary,
  type DepartmentCode,
} from '@/entities/member';
import { ApiError } from '@/shared/api';
import { Button } from '@/shared/ui/button';
import { PageState } from '@/shared/ui/page-state';

import { AdminUserHeader, MemberTable, UserFilters } from './AdminUserList';
import { MemberDetailPanel } from './MemberDetailPanel';

/** Server Component가 넘겨주는 초기 URL 쿼리스트링. `AdminJobListSearchParams`와 같은 패턴. */
export interface AdminUserManagementSearchParams {
  q?: string;
  status?: string;
  role?: string;
  department?: string;
  page?: string;
  memberId?: string;
}

interface AdminUserTableProps {
  initialSearchParams?: AdminUserManagementSearchParams;
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function parseEnum<T extends string>(value: string | undefined, allowed: readonly T[]): T | '' {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : '';
}

function buildQueryString(state: {
  query: string;
  status: AdminMemberStatus | '';
  role: AdminMemberRole | '';
  department: DepartmentCode | '';
  page: number;
  memberId: number | null;
}): string {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  if (state.status) params.set('status', state.status);
  if (state.role) params.set('role', state.role);
  if (state.department) params.set('department', state.department);
  if (state.page > 0) params.set('page', String(state.page + 1));
  if (state.memberId !== null) params.set('memberId', String(state.memberId));
  return params.toString();
}

/**
 * 어드민 사용자 관리 목록·상세 화면(`/admin/users`). `GET /api/v1/admin/members/search`·`/{id}`로
 * 실데이터를 불러온다(GETI-Server-V1 #216). 이번 범위(#212)는 조회 전용 — 역할·계정 상태 변경은 #59.
 * 검색·필터·페이지·선택 회원은 URL 쿼리스트링과 동기화한다(`AdminJobListPage`와 동일).
 */
export function AdminUserTable({ initialSearchParams }: AdminUserTableProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchInput, setSearchInput] = useState(() => initialSearchParams?.q ?? '');
  const [query, setQuery] = useState(() => initialSearchParams?.q ?? '');
  const [status, setStatus] = useState<AdminMemberStatus | ''>(() =>
    parseEnum(initialSearchParams?.status, ADMIN_MEMBER_STATUSES),
  );
  const [role, setRole] = useState<AdminMemberRole | ''>(() =>
    parseEnum(initialSearchParams?.role, ADMIN_MEMBER_ROLES),
  );
  const [department, setDepartment] = useState<DepartmentCode | ''>(() =>
    parseEnum(initialSearchParams?.department, ADMIN_MEMBER_DEPARTMENTS),
  );
  const [page, setPage] = useState(() => {
    const raw = Number(initialSearchParams?.page);
    return Number.isInteger(raw) && raw > 1 ? raw - 1 : 0;
  });
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(() => {
    const raw = Number(initialSearchParams?.memberId);
    return Number.isInteger(raw) && raw > 0 ? raw : null;
  });

  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const listQuery = useAdminMemberListQuery({
    name: query.trim() || undefined,
    status: status || undefined,
    role: role || undefined,
    department: department || undefined,
    page,
    size: PAGE_SIZE,
  });
  const detailQuery = useAdminMemberDetailQuery(selectedMemberId);
  const myProfileQuery = useMyProfileQuery();
  const myMemberId = myProfileQuery.data?.memberId ?? null;

  /**
   * URL의 `page`가 `totalPages`를 벗어나면(데이터 감소·직접 입력) 렌더 중에 마지막 유효 페이지로
   * 잘라 다시 렌더한다(`AdminJobListPage`와 동일, React "Adjusting state when a prop changes").
   */
  const maxPage = listQuery.data
    ? Math.max(0, listQuery.data.totalPages - 1)
    : Number.POSITIVE_INFINITY;
  if (page > maxPage) {
    setPage(maxPage);
  }

  useEffect(() => {
    const queryString = buildQueryString({
      query,
      status,
      role,
      department,
      page,
      memberId: selectedMemberId,
    });
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [query, status, role, department, page, selectedMemberId, pathname, router]);

  useEffect(() => {
    if (selectedMemberId === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedMemberId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMemberId]);

  const members = listQuery.data?.content ?? [];
  const totalCount = listQuery.data?.totalElements ?? 0;
  const hasActiveFilters = Boolean(query.trim() || status || role || department);

  function handleQueryChange(value: string) {
    setSearchInput(value);
    setPage(0);
  }

  function handleFilterChange<T extends string>(setter: (value: T | '') => void) {
    return (value: string) => {
      setter(value as T | '');
      setPage(0);
    };
  }

  function handleSelectMember(member: AdminMemberSummary) {
    setSelectedMemberId(member.memberId);
  }

  const isForbidden = listQuery.error instanceof ApiError && listQuery.error.status === 403;

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminUserHeader />

      <main className="px-4 py-8 xl:px-6 xl:py-10 2xl:px-10">
        <div className="w-full max-w-[1620px]">
          <header>
            <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
              사용자 관리
            </h1>
            <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-700">
              회원의 역할과 계정 상태를 조회합니다.
            </p>
          </header>

          <UserFilters
            department={department}
            query={searchInput}
            role={role}
            status={status}
            onDepartmentChange={handleFilterChange<DepartmentCode>(setDepartment)}
            onQueryChange={handleQueryChange}
            onRoleChange={handleFilterChange<AdminMemberRole>(setRole)}
            onStatusChange={handleFilterChange<AdminMemberStatus>(setStatus)}
          />

          <section className="mt-6">
            <h2 className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
              {listQuery.data ? `총 ${totalCount}명` : '사용자 목록'}
            </h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
              {listQuery.isLoading ? (
                <PageState
                  variant="loading"
                  title="사용자 정보를 불러오고 있습니다."
                  description="잠시만 기다려 주세요."
                />
              ) : isForbidden ? (
                <PageState
                  variant="error"
                  title="접근 권한이 없습니다."
                  description="사용자 관리는 개발자 권한이 있는 계정만 이용할 수 있습니다."
                />
              ) : listQuery.isError ? (
                <div className="flex flex-col items-center gap-4 pb-10">
                  <PageState
                    variant="error"
                    title="사용자 정보를 불러오지 못했습니다."
                    description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
                  />
                  <Button onClick={() => listQuery.refetch()}>다시 시도</Button>
                </div>
              ) : members.length === 0 ? (
                <PageState
                  variant="empty"
                  title={hasActiveFilters ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
                  description={
                    hasActiveFilters
                      ? '검색어 또는 필터 조건을 변경해 보세요.'
                      : '사용자가 등록되면 이 화면에서 역할과 계정 상태를 확인할 수 있습니다.'
                  }
                />
              ) : (
                <MemberTable
                  members={members}
                  myMemberId={myMemberId}
                  onSelectMember={handleSelectMember}
                />
              )}
            </div>

            {listQuery.data && listQuery.data.totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={listQuery.data.first}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-700 disabled:opacity-40"
                >
                  이전
                </button>
                <p className="text-sm text-neutral-700">
                  {page + 1} / {listQuery.data.totalPages}
                </p>
                <button
                  type="button"
                  disabled={listQuery.data.last}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-700 disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </main>

      {selectedMemberId !== null ? (
        <MemberDetailPanel
          isError={detailQuery.isError}
          isLoading={detailQuery.isLoading}
          isSelf={selectedMemberId === myMemberId}
          member={detailQuery.data}
          onClose={() => setSelectedMemberId(null)}
          onRetry={() => detailQuery.refetch()}
        />
      ) : null}
    </div>
  );
}
