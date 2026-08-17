'use client';

import { useMemo, useState } from 'react';

import type { AdminCompanyListItem, AdminCompanyType, MouStatus } from '@/entities/company';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PageState } from '@/shared/ui/page-state';

import { AdminCompanyFilters } from './AdminCompanyFilters';
import {
  DeleteConfirmDialog,
  DeleteForbiddenDialog,
  DeleteResultDialog,
  DeletingDialog,
  RegisterCompleteDialog,
  type DeleteResult,
} from './AdminCompanyDialogs';
import { AdminCompanyHeader } from './AdminCompanyHeader';
import { AdminCompanyTable } from './AdminCompanyTable';

export type AdminCompanyManagementVariant =
  | 'delete-confirm'
  | 'delete-confirm-allowed'
  | 'delete-error'
  | 'delete-forbidden'
  | 'delete-success'
  | 'deleting'
  | 'empty'
  | 'error'
  | 'loading'
  | 'register-complete'
  | 'success';

type ListStatus = 'empty' | 'error' | 'loading' | 'success';

function getListStatus(variant: AdminCompanyManagementVariant): ListStatus {
  return variant === 'empty' || variant === 'error' || variant === 'loading' ? variant : 'success';
}

function getInitialDeleteResult(variant: AdminCompanyManagementVariant): DeleteResult {
  if (variant === 'delete-success') return 'success';
  if (variant === 'delete-error') return 'error';
  return null;
}

function getInitialDeleteTarget(
  variant: AdminCompanyManagementVariant,
  companies: AdminCompanyListItem[],
): AdminCompanyListItem | null {
  if (variant === 'delete-confirm') return companies.find((c) => c.activeJobCount > 0) ?? null;
  if (variant === 'delete-confirm-allowed') {
    return companies.find((c) => c.activeJobCount === 0) ?? null;
  }
  return null;
}

interface AdminCompanyManagementProps {
  companies: AdminCompanyListItem[];
  initialVariant: AdminCompanyManagementVariant;
}

/**
 * 어드민 기업 관리 화면. 검색·필터, 목록 표, 삭제 확인/결과 모달, 등록 완료 모달을 조합한다.
 * 디자인 단계라 `initialVariant`는 호출부에서 목업 값을 넘겨준다.
 * API 연동 이슈에서 로컬 상태를 `useQuery`/`useMutation` 결과로 교체한다.
 */
export function AdminCompanyManagement({
  companies: initialCompanies,
  initialVariant,
}: AdminCompanyManagementProps) {
  const [listStatus, setListStatus] = useState<ListStatus>(getListStatus(initialVariant));
  const [companies, setCompanies] = useState(initialCompanies);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AdminCompanyType | ''>('');
  const [mouFilter, setMouFilter] = useState<MouStatus | ''>('');
  const [deleteTarget, setDeleteTarget] = useState<AdminCompanyListItem | null>(
    getInitialDeleteTarget(initialVariant, initialCompanies),
  );
  const [isDeleting] = useState(initialVariant === 'deleting');
  const [isDeleteForbidden, setIsDeleteForbidden] = useState(
    initialVariant === 'delete-forbidden',
  );
  const [deleteResult, setDeleteResult] = useState<DeleteResult>(
    getInitialDeleteResult(initialVariant),
  );
  const [showRegisterComplete, setShowRegisterComplete] = useState(
    initialVariant === 'register-complete',
  );

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');

    return companies.filter((company) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        company.name.toLocaleLowerCase('ko-KR').includes(normalizedQuery);
      const matchesType = typeFilter === '' || company.type === typeFilter;
      const matchesMou = mouFilter === '' || company.mouStatus === mouFilter;

      return matchesQuery && matchesType && matchesMou;
    });
  }, [companies, mouFilter, query, typeFilter]);

  const confirmDelete = () => {
    if (!deleteTarget || deleteTarget.activeJobCount > 0) return;

    setCompanies((current) => current.filter((company) => company.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleteResult('success');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminCompanyHeader />

      <main className="px-4 py-8 xl:px-6 xl:py-10 2xl:px-10">
        <div className="w-full max-w-[1620px]">
          <header>
            <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
              기업 관리
            </h1>
            <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-700">
              기업 정보와 MOU 체결 상태를 관리합니다.
            </p>
          </header>

          <AdminCompanyFilters
            mouFilter={mouFilter}
            query={query}
            typeFilter={typeFilter}
            onMouChange={(value) => setMouFilter(value === 'ALL' ? '' : (value as MouStatus))}
            onQueryChange={setQuery}
            onRegisterClick={() => setShowRegisterComplete(true)}
            onTypeChange={(value) =>
              setTypeFilter(value === 'ALL' ? '' : (value as AdminCompanyType))
            }
          />

          <section className="mt-8" aria-labelledby="admin-company-count">
            <h2
              id="admin-company-count"
              className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900"
            >
              총 {listStatus === 'success' ? filteredCompanies.length : companies.length}개 기업
            </h2>
            <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
              {listStatus === 'loading' ? (
                <PageState
                  variant="loading"
                  title="기업 정보를 불러오고 있습니다."
                  description="잠시만 기다려 주세요."
                />
              ) : null}
              {listStatus === 'error' ? (
                <div>
                  <PageState
                    variant="error"
                    title="기업 정보를 불러오지 못했습니다."
                    description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
                  />
                  <div className="flex justify-center pb-10">
                    <Button onClick={() => setListStatus('success')}>다시 시도</Button>
                  </div>
                </div>
              ) : null}
              {listStatus === 'empty' ||
              (listStatus === 'success' && filteredCompanies.length === 0) ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 px-6 text-center">
                  <Icon name="searchLarge" className="size-[72px] text-neutral-400" />
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
                      검색 결과가 없습니다.
                    </p>
                    <p className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600">
                      검색어를 확인하거나 다른 키워드로 검색해보세요.
                    </p>
                  </div>
                </div>
              ) : null}
              {listStatus === 'success' && filteredCompanies.length > 0 ? (
                <AdminCompanyTable companies={filteredCompanies} onDeleteClick={setDeleteTarget} />
              ) : null}
            </div>
          </section>
        </div>
      </main>

      <DeleteConfirmDialog
        company={deleteTarget ?? undefined}
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      {isDeleting ? <DeletingDialog /> : null}
      {isDeleteForbidden ? (
        <DeleteForbiddenDialog onClose={() => setIsDeleteForbidden(false)} />
      ) : null}
      {deleteResult ? (
        <DeleteResultDialog result={deleteResult} onClose={() => setDeleteResult(null)} />
      ) : null}
      {showRegisterComplete ? (
        <RegisterCompleteDialog onClose={() => setShowRegisterComplete(false)} />
      ) : null}
    </div>
  );
}
