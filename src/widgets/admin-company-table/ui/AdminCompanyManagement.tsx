'use client';

import { useMemo, useState } from 'react';

import type {
  AdminCompanyListItem,
  AdminCompanyType,
  MouStatus,
} from '@/entities/company';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

import { AdminCompanyFilters } from './AdminCompanyFilters';
import {
  DeleteConfirmDialog,
  DeleteForbiddenDialog,
  DeleteResultDialog,
  DeletingDialog,
  EditCompleteDialog,
  RegisterCompleteDialog,
  RegisterConfirmDialog,
  RegisteringDialog,
  type DeleteResult,
} from './AdminCompanyDialogs';
import { AdminCompanyHeader } from './AdminCompanyHeader';
import {
  AdminCompanyRegisterPanel,
  type AdminCompanyEditInitialValues,
  type AdminCompanyRegisterFormValues,
} from './AdminCompanyRegisterPanel';
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
  | 'register-confirm'
  | 'register-panel'
  | 'registering'
  | 'success';

type ListStatus = 'empty' | 'error' | 'loading' | 'success';
type PanelMode = 'create' | 'edit' | null;

interface PendingSubmit {
  mode: 'register' | 'edit';
  values: AdminCompanyRegisterFormValues;
  targetId?: string;
}

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

function getInitialPendingSubmit(
  variant: AdminCompanyManagementVariant,
  companies: AdminCompanyListItem[],
): PendingSubmit | null {
  if (variant !== 'register-confirm') return null;
  const target = companies[0];
  if (!target) return null;

  return {
    mode: 'register',
    values: {
      name: target.name,
      type: target.type,
      infoSource: target.infoSource,
      mouStatus: target.mouStatus,
      mouPeriod: target.mouPeriod ?? '',
      description: '',
      memo: '',
    },
  };
}

function parseMouPeriod(mouPeriod: string | null): { mouStartDate: string; mouEndDate: string } {
  if (!mouPeriod) return { mouStartDate: '', mouEndDate: '' };
  const [start, end] = mouPeriod.split(' – ');
  return {
    mouStartDate: (start ?? '').replaceAll('.', '-'),
    mouEndDate: (end ?? '').replaceAll('.', '-'),
  };
}

function buildRegisteredCompany(values: AdminCompanyRegisterFormValues): AdminCompanyListItem {
  const id = `admin-company-${Date.now()}`;

  return {
    id,
    name: values.name,
    type: values.type,
    infoSource: values.infoSource,
    mouStatus: values.mouStatus,
    mouPeriod: values.mouStatus === 'unsigned' ? null : values.mouPeriod,
    statusLabel: '정상',
    detailHref: `/admin/companies/${id}`,
    activeJobCount: 0,
    activeMouJobCount: 0,
    applicationCount: 0,
  };
}

function applyEditValues(
  company: AdminCompanyListItem,
  values: AdminCompanyRegisterFormValues,
): AdminCompanyListItem {
  return {
    ...company,
    name: values.name,
    type: values.type,
    infoSource: values.infoSource,
    mouStatus: values.mouStatus,
    mouPeriod: values.mouStatus === 'unsigned' ? null : values.mouPeriod,
  };
}

interface AdminCompanyManagementProps {
  companies: AdminCompanyListItem[];
  initialVariant: AdminCompanyManagementVariant;
}

/**
 * 어드민 기업 관리 화면. 검색·필터, 목록 표, 등록/수정 패널, 삭제·등록·수정 확인/결과 모달을 조합한다.
 * "수정"은 별도 페이지가 아니라 등록 패널을 재사용하는 수정 모드로 열린다(Figma 933:16523).
 * 등록·수정 모두 패널 제출 후 요약 확인 모달을 거친 뒤에만 실제로 반영된다(Figma 933:10927).
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
  const [panelMode, setPanelMode] = useState<PanelMode>(
    initialVariant === 'register-panel' ? 'create' : null,
  );
  const [editTarget, setEditTarget] = useState<AdminCompanyListItem | null>(null);
  const [isRegistering] = useState(initialVariant === 'registering');
  const [pendingSubmit, setPendingSubmit] = useState<PendingSubmit | null>(
    getInitialPendingSubmit(initialVariant, initialCompanies),
  );
  const [showRegisterComplete, setShowRegisterComplete] = useState(
    initialVariant === 'register-complete',
  );
  const [showEditComplete, setShowEditComplete] = useState(false);

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

  const isNoCompaniesAtAll =
    listStatus === 'empty' || (listStatus === 'success' && companies.length === 0);
  const isSearchEmpty =
    listStatus === 'success' && companies.length > 0 && filteredCompanies.length === 0;

  const confirmDelete = () => {
    if (!deleteTarget || deleteTarget.activeJobCount > 0) return;

    setCompanies((current) => current.filter((company) => company.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleteResult('success');
  };

  const openRegisterPanel = () => {
    setEditTarget(null);
    setPanelMode('create');
  };

  const openEditPanel = (company: AdminCompanyListItem) => {
    setEditTarget(company);
    setPanelMode('edit');
  };

  const closePanel = () => {
    setPanelMode(null);
    setEditTarget(null);
  };

  const requestSubmitConfirm = (values: AdminCompanyRegisterFormValues) => {
    setPendingSubmit({
      mode: panelMode === 'edit' ? 'edit' : 'register',
      values,
      targetId: editTarget?.id,
    });
  };

  const cancelSubmitConfirm = () => setPendingSubmit(null);

  const confirmSubmit = () => {
    if (!pendingSubmit) return;

    if (pendingSubmit.mode === 'register') {
      setCompanies((current) => [buildRegisteredCompany(pendingSubmit.values), ...current]);
      setShowRegisterComplete(true);
    } else {
      setCompanies((current) =>
        current.map((company) =>
          company.id === pendingSubmit.targetId
            ? applyEditValues(company, pendingSubmit.values)
            : company,
        ),
      );
      setShowEditComplete(true);
    }

    setPendingSubmit(null);
    closePanel();
  };

  const editInitialValues: AdminCompanyEditInitialValues | undefined = editTarget
    ? {
        name: editTarget.name,
        type: editTarget.type,
        infoSource: editTarget.infoSource,
        mouStatus: editTarget.mouStatus,
        ...parseMouPeriod(editTarget.mouPeriod),
        description: '',
        memo: '',
      }
    : undefined;

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
            onRegisterClick={openRegisterPanel}
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
            <div className="mt-6">
              {listStatus === 'loading' ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 px-6 text-center">
                  <Icon name="spinner" className="size-[72px] animate-spin text-neutral-600" />
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
                      정보를 불러오는 중입니다.
                    </p>
                    <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
                      잠시만 기다려 주세요.
                    </p>
                  </div>
                </div>
              ) : null}
              {listStatus === 'error' ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 px-6 text-center">
                  <Icon name="alertCircleOutline" className="size-[72px] text-neutral-600" />
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
                      기업 정보를 불러오지 못했습니다.
                    </p>
                    <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
                      잠시 후 다시 시도해 주세요.
                    </p>
                  </div>
                  <Button onClick={() => setListStatus('success')}>다시 시도</Button>
                </div>
              ) : null}
              {isNoCompaniesAtAll ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 px-6 text-center">
                  <Icon name="buildingAdd" className="size-[72px] text-neutral-600" />
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
                      등록된 기업이 없습니다.
                    </p>
                    <p className="text-base leading-[1.6] tracking-[-0.16px] whitespace-pre-line text-neutral-600">
                      {'아직 등록된 기업 정보가 없습니다.\n기업을 등록하면 이곳에서 상세 정보를 확인할 수 있습니다.'}
                    </p>
                  </div>
                </div>
              ) : null}
              {isSearchEmpty ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 px-6 text-center">
                  <Icon name="searchLarge" className="size-[72px] text-neutral-600" />
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
                      검색 결과가 없습니다.
                    </p>
                    <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
                      검색어를 확인하거나 다른 키워드로 검색해보세요.
                    </p>
                  </div>
                </div>
              ) : null}
              {listStatus === 'success' && filteredCompanies.length > 0 ? (
                <div className="overflow-hidden rounded-lg bg-white">
                  <AdminCompanyTable
                    companies={filteredCompanies}
                    onDeleteClick={setDeleteTarget}
                    onEditClick={openEditPanel}
                  />
                </div>
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
      <AdminCompanyRegisterPanel
        key={panelMode === 'edit' ? (editTarget?.id ?? 'edit') : 'create'}
        isOpen={panelMode !== null}
        mode={panelMode === 'edit' ? 'edit' : 'create'}
        initialValues={panelMode === 'edit' ? editInitialValues : undefined}
        onClose={closePanel}
        onSubmit={requestSubmitConfirm}
      />
      {pendingSubmit ? (
        <RegisterConfirmDialog
          mode={pendingSubmit.mode}
          values={pendingSubmit.values}
          onCancel={cancelSubmitConfirm}
          onConfirm={confirmSubmit}
        />
      ) : null}
      {isRegistering ? <RegisteringDialog /> : null}
      {showRegisterComplete ? (
        <RegisterCompleteDialog onClose={() => setShowRegisterComplete(false)} />
      ) : null}
      {showEditComplete ? <EditCompleteDialog onClose={() => setShowEditComplete(false)} /> : null}
    </div>
  );
}
