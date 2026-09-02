'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useCompanyOptionsQuery, type CompanyOption } from '@/entities/company';
import { useAdminJobDetailQuery, useUpdateAdminJobMutation } from '@/entities/job';
import { PageState } from '@/shared/ui/page-state';
import { AppToaster, showToast } from '@/shared/ui/toast';
import {
  AdminJobForm,
  toJobFormValues,
  toJobUpdatePayload,
  type AdminJobFormValues,
} from '@/widgets/admin-job-form';

interface AdminJobEditPageProps {
  jobId: string;
}

/**
 * 어드민 공고 수정 화면(`/admin/jobs/[jobId]/edit`). `GET /api/v1/admin/jobs/{jobId}`로 기존 값을
 * 불러와 폼에 채우고 `PATCH /api/v1/admin/jobs/{jobId}`(`useUpdateAdminJobMutation`)로 저장한다.
 * 기업·공고 유형·지원 방식·게시 상태는 이 API로 못 바꿔 폼에서 읽기 전용이다(마감·삭제는 목록 표).
 * 라우트 파라미터가 정수가 아니거나 조회 실패면 오류 상태를 보여준다(`AdminJobDetailPage`와 동일).
 */
export function AdminJobEditPage({ jobId }: AdminJobEditPageProps) {
  const router = useRouter();
  const numericId = Number(jobId);
  const isValidId = Number.isInteger(numericId);

  const detailQuery = useAdminJobDetailQuery(isValidId ? numericId : null);
  const companyOptionsQuery = useCompanyOptionsQuery();
  const updateMutation = useUpdateAdminJobMutation();
  const [serverErrorMessage, setServerErrorMessage] = useState<string>();

  const detail = detailQuery.data;
  const isError = !isValidId || detailQuery.isError;
  const isLoading = !isError && (detailQuery.isLoading || !detail || companyOptionsQuery.isLoading);

  function handleSubmit(values: AdminJobFormValues) {
    if (!isValidId) return;
    setServerErrorMessage(undefined);

    updateMutation.mutate(
      { jobId: numericId, payload: toJobUpdatePayload(values) },
      {
        onSuccess: () => {
          showToast({ tone: 'success', message: '공고를 수정했습니다.' });
          router.push(`/admin/jobs/${numericId}`);
        },
        onError: (error) => setServerErrorMessage(error.message),
      },
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-[16px] bg-neutral-50">
        <PageState
          variant="error"
          title="공고 정보를 불러오지 못했습니다."
          description="삭제되었거나 접근 권한이 없는 공고일 수 있습니다."
        />
        {isValidId && (
          <button
            type="button"
            onClick={() => detailQuery.refetch()}
            className="bg-primary-700 rounded-[8px] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
          >
            다시 시도
          </button>
        )}
      </div>
    );
  }

  if (isLoading || !detail) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <PageState
          variant="loading"
          title="공고 정보를 불러오는 중입니다."
          description="잠시만 기다려 주세요."
        />
      </div>
    );
  }

  return (
    <>
      <AppToaster />
      <AdminJobForm
        mode="edit"
        companyOptions={withDetailCompany(companyOptionsQuery.data ?? [], detail.company)}
        initialValues={toJobFormValues(detail)}
        isSubmitting={updateMutation.isPending}
        serverErrorMessage={serverErrorMessage}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/admin/jobs/${numericId}`)}
      />
    </>
  );
}

/**
 * 읽기 전용으로 표시할 공고의 기업이 옵션 목록에 없으면(삭제된 기업 등) 이름이 빈칸으로 보이지
 * 않도록 앞에 끼워 넣는다.
 */
function withDetailCompany(
  options: CompanyOption[],
  company: { companyId: number; name: string } | null,
): CompanyOption[] {
  if (!company || options.some((option) => option.companyId === company.companyId)) {
    return options;
  }
  return [{ companyId: company.companyId, name: company.name }, ...options];
}
