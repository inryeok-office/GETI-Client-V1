'use client';

import { useEffect } from 'react';

import {
  useAdminMemberDetailQuery,
  useAdminMemberListQuery,
  useMyProfileQuery,
  useUpdateAdminMemberRolesMutation,
  useUpdateAdminMemberStatusMutation,
  type AdminMemberRole,
  type AdminMemberStatus,
} from '@/entities/member';
import { ApiError } from '@/shared/api';
import { AppToaster, showToast } from '@/shared/ui/toast';

import { toListParams } from '../model/adminUserSearchParams';
import { toActionErrorMessage } from '../model/toActionErrorMessage';
import { useAdminUserFilters } from '../model/useAdminUserFilters';
import { AdminUserHeader, UserFilters } from './AdminUserList';
import { MemberDetailPanel } from './MemberDetailPanel';
import { MemberListSection } from './MemberListSection';

/**
 * 어드민 사용자 관리 화면(`/admin/users`). 목록·상세 조회(`GET /admin/members/search`·`/{id}`)와
 * 역할·계정 상태 변경(`PATCH .../roles`·`.../status`)을 연동한다(GETI-Server-V1 #216).
 *
 * 검색·필터·페이지·선택 회원은 `useAdminUserFilters`가 **URL을 source of truth로** 동기화하고,
 * 목록 렌더는 `MemberListSection`, 상세·편집은 `MemberDetailPanel`이 맡는다. 뮤테이션·토스터를 이
 * 컴포넌트가 소유해 상세 패널이 닫혀도 결과 토스트가 유지된다(PR #208과 같은 이유). `useSearchParams`를
 * 쓰므로 호출부에서 `<Suspense>`로 감싼다.
 */
export function AdminUserTable() {
  const {
    filters,
    searchInput,
    hasActiveFilters,
    changeSearch,
    changeStatus,
    changeRole,
    changeDepartment,
    changeCohort,
    goToPage,
    selectMember,
  } = useAdminUserFilters();

  const listQuery = useAdminMemberListQuery(toListParams(filters));
  const detailQuery = useAdminMemberDetailQuery(filters.memberId);
  const myMemberId = useMyProfileQuery().data?.memberId ?? null;

  const rolesMutation = useUpdateAdminMemberRolesMutation();
  const statusMutation = useUpdateAdminMemberStatusMutation();

  function handleUpdateRoles(roles: AdminMemberRole[]) {
    if (filters.memberId === null) return;
    rolesMutation.mutate(
      { memberId: filters.memberId, roles },
      {
        onSuccess: () => showToast({ tone: 'success', message: '역할을 변경했습니다.' }),
        onError: (error) => showToast({ tone: 'error', message: toActionErrorMessage(error) }),
      },
    );
  }

  function handleUpdateStatus(nextStatus: AdminMemberStatus) {
    if (filters.memberId === null) return;
    statusMutation.mutate(
      { memberId: filters.memberId, status: nextStatus },
      {
        onSuccess: () =>
          showToast({
            tone: 'success',
            message: nextStatus === 'SUSPENDED' ? '계정을 정지했습니다.' : '정지를 해제했습니다.',
          }),
        onError: (error) => showToast({ tone: 'error', message: toActionErrorMessage(error) }),
      },
    );
  }

  // `keepPreviousData` 때문에 조건이 바뀐 직후 `data`는 이전 조건의 placeholder다 — 이 동안은
  // 옛 목록을 새 조건 아래 노출하지 말고 로딩으로 처리하고, 페이지 보정도 새 응답이 올 때까지 미룬다.
  const isTransitioning = listQuery.isFetching && listQuery.isPlaceholderData;

  // URL의 page가 실제 totalPages를 벗어나면(데이터 감소·직접 입력) 마지막 유효 페이지로 보정한다.
  const totalPages = listQuery.isPlaceholderData ? undefined : listQuery.data?.totalPages;
  useEffect(() => {
    if (totalPages !== undefined && filters.page > Math.max(0, totalPages - 1)) {
      goToPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, filters.page, goToPage]);

  useEffect(() => {
    if (filters.memberId === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') selectMember(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filters.memberId, selectMember]);

  const isForbidden = listQuery.error instanceof ApiError && listQuery.error.status === 403;

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppToaster />
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
            cohort={filters.cohort}
            department={filters.department}
            query={searchInput}
            role={filters.role}
            status={filters.status}
            onCohortChange={changeCohort}
            onDepartmentChange={changeDepartment}
            onQueryChange={changeSearch}
            onRoleChange={changeRole}
            onStatusChange={changeStatus}
          />

          <MemberListSection
            data={listQuery.data}
            hasActiveFilters={hasActiveFilters}
            isError={listQuery.isError}
            isForbidden={isForbidden}
            isLoading={listQuery.isLoading || isTransitioning}
            myMemberId={myMemberId}
            page={filters.page}
            onGoToPage={goToPage}
            onRetry={() => listQuery.refetch()}
            onSelectMember={(member) => selectMember(member.memberId)}
          />
        </div>
      </main>

      {filters.memberId !== null ? (
        <MemberDetailPanel
          isError={detailQuery.isError}
          isLoading={detailQuery.isLoading}
          isSavingRoles={rolesMutation.isPending}
          isSavingStatus={statusMutation.isPending}
          isSelf={filters.memberId === myMemberId}
          member={detailQuery.data}
          onClose={() => selectMember(null)}
          onRetry={() => detailQuery.refetch()}
          onUpdateRoles={handleUpdateRoles}
          onUpdateStatus={handleUpdateStatus}
        />
      ) : null}
    </div>
  );
}
