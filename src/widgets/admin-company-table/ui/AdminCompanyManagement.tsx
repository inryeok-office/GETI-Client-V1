'use client';

import { useState } from 'react';

import {
  useAdminCompanyDetailQuery,
  useCompanyListQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  type AdminCompanyListItem,
  type AdminCompanyType,
  type MouStatus,
} from '@/entities/company';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { AppToaster, showToast } from '@/shared/ui/toast';

import { AdminCompanyFilters } from './AdminCompanyFilters';
import {
  EditCompleteDialog,
  RegisterCompleteDialog,
  RegisterConfirmDialog,
  RegisteringDialog,
} from './AdminCompanyDialogs';
import { AdminCompanyHeader } from './AdminCompanyHeader';
import {
  AdminCompanyRegisterPanel,
  type AdminCompanyEditInitialValues,
  type AdminCompanyRegisterFormValues,
} from './AdminCompanyRegisterPanel';
import { AdminCompanyStatusDialog } from './AdminCompanyStatusDialog';
import { AdminCompanyTable } from './AdminCompanyTable';

interface PendingSubmit {
  mode: 'register' | 'edit';
  values: AdminCompanyRegisterFormValues;
  targetId?: number;
}

/**
 * 목록 조회는 페이지네이션 UI가 아직 없어 한 번에 최대 허용치(100건)를 가져온다
 * (지원자 관리 "담당 공고" 탭과 같은 임시 처리). 100건을 넘으면 뒤 항목이 보이지 않는다 —
 * 페이지네이션 UI를 만들 때 이 상한을 없애야 한다.
 */
const LIST_SIZE = 100;

/**
 * 어드민 기업 관리 화면. 검색·필터, 목록 표, 등록/수정 패널, 등록·수정 확인/결과 모달을 조합한다.
 * `GET /companies`로 목록을, `POST /admin/companies` · `PATCH /admin/companies/{id}`로
 * 등록·수정을 연동한다(Issue #121).
 * "수정" 클릭 시 목록 응답(`CompanySummaryResponse`)에 없는 필드(설명 · MOU 기간 · 메모 등)를
 * 채우려고 `GET /admin/companies/{id}` 상세를 다시 불러온 뒤에만 패널을 연다 — 목록 값만으로
 * 패널을 열면 기존 MOU 기간 · 설명 · 메모가 빈 값으로 보여 저장 시 실수로 지워질 수 있다.
 * 학생·교사도 볼 수 있는 `GET /companies/{id}`가 아니라 어드민 전용 상세를 쓰는 이유는 메모가
 * 그 응답에만 있어서다(어드민 기업 상세, Issue #167).
 * 삭제는 서버가 아직 활성 공고 여부를 검증하지 않아(`COMPANY_HAS_ACTIVE_JOBS` 미구현) 이번
 * 범위에서 뺐다 — 백엔드 확인 후 별도로 진행한다.
 */
export function AdminCompanyManagement() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AdminCompanyType | ''>('');
  const [mouFilter, setMouFilter] = useState<MouStatus | ''>('');

  const listQuery = useCompanyListQuery({
    query: query.trim() || undefined,
    companyType: typeFilter || undefined,
    mouStatus: mouFilter || undefined,
    size: LIST_SIZE,
  });

  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState<PendingSubmit | null>(null);
  const [showRegisterComplete, setShowRegisterComplete] = useState(false);
  const [showEditComplete, setShowEditComplete] = useState(false);

  const editDetailQuery = useAdminCompanyDetailQuery(editingCompanyId);
  const createMutation = useCreateCompanyMutation();
  const updateMutation = useUpdateCompanyMutation();

  const companies = listQuery.data?.content ?? [];
  const hasActiveFilter = query.trim() !== '' || typeFilter !== '' || mouFilter !== '';
  const isNoCompaniesAtAll = listQuery.isSuccess && companies.length === 0 && !hasActiveFilter;
  const isSearchEmpty = listQuery.isSuccess && companies.length === 0 && hasActiveFilter;

  const openRegisterPanel = () => setIsCreatePanelOpen(true);

  const openEditPanel = (company: AdminCompanyListItem) => setEditingCompanyId(company.companyId);

  const closeEditPanel = () => setEditingCompanyId(null);

  const requestSubmitConfirm = (mode: 'register' | 'edit', targetId?: number) => {
    return (values: AdminCompanyRegisterFormValues) => {
      setPendingSubmit({ mode, values, targetId });
    };
  };

  const cancelSubmitConfirm = () => setPendingSubmit(null);

  const confirmSubmit = () => {
    if (!pendingSubmit) return;

    const submission = pendingSubmit;
    setPendingSubmit(null);

    const payload = {
      name: submission.values.name,
      companyType: submission.values.type,
      mouStatus: submission.values.mouStatus,
      sourceName: 'manual',
      description: submission.values.description || null,
      mouStartDate: submission.values.mouStartDate || null,
      mouEndDate: submission.values.mouEndDate || null,
      // PATCH는 null/미전달을 "기존 값 유지"로 처리한다(CompanyUpdateRequest KDoc) — null로
      // 접으면 수정 시 메모를 지워도 반영되지 않는다. 빈 문자열은 그대로 보내 실제로 비워지게
      // 한다(PR #169 코드리뷰 반영).
      memo: submission.values.memo,
    };

    if (submission.mode === 'register') {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setIsCreatePanelOpen(false);
          setShowRegisterComplete(true);
        },
        onError: (error) => showToast({ tone: 'error', message: error.message }),
      });
    } else if (submission.targetId !== undefined) {
      updateMutation.mutate(
        { companyId: submission.targetId, payload },
        {
          onSuccess: () => {
            closeEditPanel();
            setShowEditComplete(true);
          },
          onError: (error) => showToast({ tone: 'error', message: error.message }),
        },
      );
    }
  };

  const editRecord = editDetailQuery.data;
  const editInitialValues: AdminCompanyEditInitialValues | undefined = editRecord
    ? {
        name: editRecord.name,
        type: editRecord.companyType,
        mouStatus: editRecord.mouStatus,
        mouStartDate: editRecord.mouStartDate ?? '',
        mouEndDate: editRecord.mouEndDate ?? '',
        description: editRecord.description ?? '',
        memo: editRecord.memo ?? '',
      }
    : undefined;

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminCompanyHeader />
      <AppToaster />

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
              총 {companies.length}개 기업
            </h2>
            <div className="mt-6">
              {listQuery.isLoading ? (
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
              {listQuery.isError ? (
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
                  <Button onClick={() => listQuery.refetch()}>다시 시도</Button>
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
                      {
                        '아직 등록된 기업 정보가 없습니다.\n기업을 등록하면 이곳에서 상세 정보를 확인할 수 있습니다.'
                      }
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
              {listQuery.isSuccess && companies.length > 0 ? (
                <div className="overflow-hidden rounded-lg bg-white">
                  <AdminCompanyTable companies={companies} onEditClick={openEditPanel} />
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </main>

      <AdminCompanyRegisterPanel
        isOpen={isCreatePanelOpen}
        mode="create"
        onClose={() => setIsCreatePanelOpen(false)}
        onSubmit={requestSubmitConfirm('register')}
      />
      {editingCompanyId !== null && editInitialValues ? (
        <AdminCompanyRegisterPanel
          key={editingCompanyId}
          isOpen
          mode="edit"
          initialValues={editInitialValues}
          onClose={closeEditPanel}
          onSubmit={requestSubmitConfirm('edit', editingCompanyId)}
        />
      ) : null}
      {editingCompanyId !== null && editDetailQuery.isLoading ? (
        <AdminCompanyStatusDialog
          icon={<Icon name="spinner" className="text-primary-700 size-16 animate-spin" />}
          title="기업 정보를 불러오는 중입니다."
          description="잠시만 기다려 주세요."
        />
      ) : null}
      {editingCompanyId !== null && editDetailQuery.isError ? (
        <AdminCompanyStatusDialog
          icon={<Icon name="alertCircleOutline" className="size-16 text-neutral-600" />}
          title="기업 정보를 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
          actions={
            <Button className="w-full" onClick={closeEditPanel}>
              확인
            </Button>
          }
        />
      ) : null}
      {pendingSubmit ? (
        <RegisterConfirmDialog
          mode={pendingSubmit.mode}
          values={pendingSubmit.values}
          onCancel={cancelSubmitConfirm}
          onConfirm={confirmSubmit}
        />
      ) : null}
      {createMutation.isPending ? <RegisteringDialog mode="register" /> : null}
      {updateMutation.isPending ? <RegisteringDialog mode="edit" /> : null}
      {showRegisterComplete ? (
        <RegisterCompleteDialog onClose={() => setShowRegisterComplete(false)} />
      ) : null}
      {showEditComplete ? <EditCompleteDialog onClose={() => setShowEditComplete(false)} /> : null}
    </div>
  );
}
