'use client';

import { useState } from 'react';

import {
  mapAdminCompanyAuditLogEntry,
  mapAdminCompanyConnectedJob,
  mapAdminCompanyDetail,
  useAdminCompanyDetailQuery,
  useUpdateCompanyMutation,
} from '@/entities/company';
import { AppToaster, showToast } from '@/shared/ui/toast';
import {
  AdminCompanyHeader,
  AdminCompanyRegisterPanel,
  type AdminCompanyEditInitialValues,
  type AdminCompanyRegisterFormValues,
} from '@/widgets/admin-company-table';
import { AdminCompanyDetail, AdminCompanyDetailEmptyState } from '@/widgets/admin-company-detail';

interface AdminCompanyDetailPageProps {
  companyId: string;
}

/**
 * 어드민 기업 상세 화면. `GET /api/v1/admin/companies/{id}`(`entities/company`의
 * `useAdminCompanyDetailQuery`)로 실제 데이터를 불러온다(Issue #167). 개발자 전용 API다.
 *
 * "수정"은 어드민 기업 관리(#121)의 `AdminCompanyRegisterPanel`을 그대로 재사용한다 — 별도
 * 편집 UI를 새로 만들지 않기로 했다(이슈 확인 필요 1번). 성공·실패 모두 토스트로 안내하며,
 * "동시 편집 충돌"·"기업명 중복 비교 표시"는 서버가 구분 신호나 비교 정보를 주지 않아 별도
 * 모달 없이 일반 오류 토스트로 통합했다(확인 필요 2·3번).
 *
 * 라우트 파라미터가 정수가 아니거나 조회가 실패하면(404 포함, 서버가 삭제와 비공개를
 * 구분해 주지 않는다) 네트워크 오류 상태를 보여준다 — 이 화면은 학생용 상세(#156)와 달리
 * "비공개" 개념을 Figma가 요구하지 않아 별도 상태로 나누지 않는다.
 */
export function AdminCompanyDetailPage({ companyId }: AdminCompanyDetailPageProps) {
  const numericId = Number(companyId);
  const isValidId = Number.isInteger(numericId);

  const detailQuery = useAdminCompanyDetailQuery(isValidId ? numericId : null);
  const updateMutation = useUpdateCompanyMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);

  const record = detailQuery.data;
  const isError = !isValidId || detailQuery.isError;

  const editInitialValues: AdminCompanyEditInitialValues | undefined = record
    ? {
        name: record.name,
        type: record.companyType,
        mouStatus: record.mouStatus,
        mouStartDate: record.mouStartDate ?? '',
        mouEndDate: record.mouEndDate ?? '',
        description: record.description ?? '',
        memo: record.memo ?? '',
      }
    : undefined;

  const handleSubmit = (values: AdminCompanyRegisterFormValues) => {
    if (!isValidId) return;

    updateMutation.mutate(
      {
        companyId: numericId,
        payload: {
          name: values.name,
          companyType: values.type,
          mouStatus: values.mouStatus,
          description: values.description || null,
          mouStartDate: values.mouStartDate || null,
          mouEndDate: values.mouEndDate || null,
          memo: values.memo || null,
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          showToast({ tone: 'success', message: '기업 정보를 수정했습니다.' });
        },
        onError: (error) => showToast({ tone: 'error', message: error.message }),
      },
    );
  };

  return (
    <>
      <AdminCompanyHeader />
      <AppToaster />

      <main>
        {isError ? (
          <AdminCompanyDetailEmptyState
            status="network-error"
            onRetry={() => detailQuery.refetch()}
          />
        ) : detailQuery.isLoading || !record ? (
          <AdminCompanyDetailEmptyState status="loading" />
        ) : (
          <AdminCompanyDetail
            company={mapAdminCompanyDetail(record)}
            connectedJobs={record.connectedJobs.map(mapAdminCompanyConnectedJob)}
            stats={record.stats}
            auditLog={record.recentChanges.map(mapAdminCompanyAuditLogEntry)}
            onEditClick={() => setIsEditOpen(true)}
          />
        )}
      </main>

      <AdminCompanyRegisterPanel
        isOpen={isEditOpen}
        mode="edit"
        initialValues={editInitialValues}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
