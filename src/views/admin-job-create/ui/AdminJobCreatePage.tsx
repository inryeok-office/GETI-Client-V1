'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useCompanyOptionsQuery } from '@/entities/company';
import { useCreateAdminJobMutation } from '@/entities/job';
import { PageState } from '@/shared/ui/page-state';
import { AppToaster, showToast } from '@/shared/ui/toast';
import {
  AdminJobForm,
  toJobCreatePayload,
  type AdminJobFormValues,
} from '@/widgets/admin-job-form';

/**
 * 어드민 공고 등록 화면(`/admin/jobs/new`). `POST /api/v1/admin/jobs`(`useCreateAdminJobMutation`)로
 * 임시저장(DRAFT) 또는 게시(PUBLISHED)한다. 기업 선택지는 `useCompanyOptionsQuery`로 불러온다.
 * 성공하면 방금 만든 공고의 상세로 이동한다 — 임시저장 공고는 목록(공개 검색 API)에 안 잡히므로
 * 상세로 보내야 다시 열어볼 수 있다(Issue #202의 목록 한계).
 * 서버 검증 실패(`JOB_VALIDATION_FAILED`, `JOB_FORM_REQUIRED` 등)는 폼 상단에 메시지를 그대로 띄운다.
 */
export function AdminJobCreatePage() {
  const router = useRouter();
  const companyOptionsQuery = useCompanyOptionsQuery();
  const createMutation = useCreateAdminJobMutation();
  const [serverErrorMessage, setServerErrorMessage] = useState<string>();

  function handleSubmit(values: AdminJobFormValues, status?: 'DRAFT' | 'PUBLISHED') {
    if (!status) return;
    setServerErrorMessage(undefined);

    createMutation.mutate(toJobCreatePayload(values, status), {
      onSuccess: (job) => {
        showToast({
          tone: 'success',
          message: status === 'PUBLISHED' ? '공고를 게시했습니다.' : '공고를 임시저장했습니다.',
        });
        router.push(`/admin/jobs/${job.jobId}`);
      },
      onError: (error) => setServerErrorMessage(error.message),
    });
  }

  if (companyOptionsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <PageState
          variant="loading"
          title="공고 작성 화면을 준비하는 중입니다."
          description="기업 목록을 불러오고 있습니다."
        />
      </div>
    );
  }

  if (companyOptionsQuery.isError || !companyOptionsQuery.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-[16px] bg-neutral-50">
        <PageState
          variant="error"
          title="기업 목록을 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
        />
        <button
          type="button"
          onClick={() => companyOptionsQuery.refetch()}
          className="bg-primary-700 rounded-[8px] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <>
      <AppToaster />
      <AdminJobForm
        mode="create"
        companyOptions={companyOptionsQuery.data}
        isSubmitting={createMutation.isPending}
        serverErrorMessage={serverErrorMessage}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/jobs')}
      />
    </>
  );
}
