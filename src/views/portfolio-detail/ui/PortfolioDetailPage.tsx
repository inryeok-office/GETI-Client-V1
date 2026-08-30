'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { downloadCommonFile } from '@/entities/common-file';
import {
  formatDueAt,
  usePortfolioRequestDetailQuery,
  useUpsertPortfolioSubmissionMutation,
  type PortfolioRequestDetailApiResponse,
  type PortfolioSubmissionApiResponse,
  type PortfolioSubmissionUpsertRequest,
} from '@/entities/portfolio-request';
import { PortfolioSubmissionForm } from '@/features/submit-portfolio';
import { ApiError } from '@/shared/api';
import { Icon } from '@/shared/ui/icon';
import { PageState } from '@/shared/ui/page-state';
import { AppToaster, showToast } from '@/shared/ui/toast';
import { SiteHeader } from '@/widgets/site-header';

interface PortfolioDetailPageProps {
  requestId: string;
}

export function PortfolioDetailPage({ requestId }: PortfolioDetailPageProps) {
  const numericRequestId = Number(requestId);
  const detailQuery = usePortfolioRequestDetailQuery(numericRequestId);
  const submissionMutation = useUpsertPortfolioSubmissionMutation(numericRequestId);
  const [submission, setSubmission] = useState<PortfolioSubmissionApiResponse | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const isInvalidRequestId = !Number.isFinite(numericRequestId);
  const isUnavailable =
    detailQuery.error instanceof ApiError &&
    ['NOT_REQUEST_TARGET', 'PORTFOLIO_REQUEST_NOT_FOUND', 'SUBMISSION_CLOSED'].includes(
      detailQuery.error.code ?? '',
    );
  const isClosed =
    detailQuery.data !== undefined &&
    (detailQuery.data.status !== 'PUBLISHED' || isPastDueAt(detailQuery.data.dueAt, now));
  const isSubmitted = submission?.status === 'SUBMITTED';

  useEffect(() => {
    if (detailQuery.data === undefined || detailQuery.data.status !== 'PUBLISHED') return;

    const dueAt = new Date(detailQuery.data.dueAt).getTime();
    if (Number.isNaN(dueAt) || dueAt < now) return;

    const timeoutId = window.setTimeout(
      () => setNow(Date.now()),
      Math.min(dueAt - now + 1, 2_147_483_647),
    );

    return () => window.clearTimeout(timeoutId);
  }, [detailQuery.data, now]);

  const handleSubmit = async (request: PortfolioSubmissionUpsertRequest) => {
    if (detailQuery.data !== undefined && isSubmissionClosed(detailQuery.data)) {
      throw new Error('제출 기간이 종료되었습니다.');
    }

    const result = await submissionMutation.mutateAsync(request);
    setSubmission(result);
    return result;
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader activeNav="포트폴리오" />
      <main className="mx-auto w-full max-w-[1312px] px-4 pt-10 pb-[120px]">
        <header className="px-1">
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
            {isSubmitted ? '제출 완료' : '포트폴리오 제출'}
          </h1>
          <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
            {isSubmitted
              ? '포트폴리오가 정상적으로 제출되었습니다.'
              : '포트폴리오 파일 또는 외부 링크를 등록하고 제출해 주세요.'}
          </p>
        </header>

        {isInvalidRequestId || detailQuery.isLoading ? (
          <div className="mt-8 rounded-lg bg-white">
            <PageState
              variant={isInvalidRequestId ? 'error' : 'loading'}
              title={
                isInvalidRequestId
                  ? '잘못된 포트폴리오 요청입니다.'
                  : '포트폴리오 요청을 불러오는 중입니다.'
              }
              description="잠시만 기다려 주세요."
            />
          </div>
        ) : null}

        {detailQuery.isError && !isUnavailable ? (
          <div className="mt-8 rounded-lg bg-white">
            <PageState
              variant="error"
              title="포트폴리오 요청을 불러올 수 없습니다."
              description="잠시 후 다시 시도해 주세요."
            />
            <div className="flex justify-center pb-12">
              <button
                type="button"
                onClick={() => detailQuery.refetch()}
                className="bg-primary-700 inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-medium text-white"
              >
                다시 시도
              </button>
            </div>
          </div>
        ) : null}

        {isUnavailable ? (
          <UnavailableSection />
        ) : detailQuery.data ? (
          <div className="mt-8 flex flex-col gap-8">
            <PortfolioRequestSummary request={detailQuery.data} />
            <PortfolioSubmissionInfo
              isClosed={isClosed}
              request={detailQuery.data}
              submission={submission}
            />

            {isSubmitted ? (
              <CompletedPortfolioMaterials submission={submission} />
            ) : (
              <PortfolioSubmissionForm
                canInteract={() =>
                  detailQuery.data !== undefined && !isSubmissionClosed(detailQuery.data)
                }
                disabled={isClosed}
                isSaving={
                  submissionMutation.isPending && submissionMutation.variables?.status === 'DRAFT'
                }
                isSubmitting={
                  submissionMutation.isPending &&
                  submissionMutation.variables?.status === 'SUBMITTED'
                }
                onSubmit={handleSubmit}
              />
            )}
          </div>
        ) : null}
      </main>
      <AppToaster />
    </div>
  );
}

function isSubmissionClosed(request: PortfolioRequestDetailApiResponse): boolean {
  return request.status !== 'PUBLISHED' || isPastDueAt(request.dueAt, Date.now());
}

function isPastDueAt(dueAt: string, now: number): boolean {
  return new Date(dueAt).getTime() < now;
}

function savePortfolioFileBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

function PortfolioRequestSummary({ request }: { request: PortfolioRequestDetailApiResponse }) {
  return (
    <section className="rounded-lg bg-white px-6 py-8">
      <span className="bg-primary-100 text-primary-700 inline-flex rounded-2xl px-3 py-1.5 text-xs leading-[1.5] font-semibold tracking-[-0.12px]">
        포트폴리오 제출 요청
      </span>
      <h2 className="mt-2 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        {request.title}
      </h2>
      {request.description ? (
        <p className="mt-2 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
          {request.description}
        </p>
      ) : null}
    </section>
  );
}

function PortfolioSubmissionInfo({
  isClosed,
  request,
  submission,
}: {
  isClosed: boolean;
  request: PortfolioRequestDetailApiResponse;
  submission: PortfolioSubmissionApiResponse | null;
}) {
  const statusText =
    submission?.status === 'SUBMITTED'
      ? '제출 완료'
      : submission?.status === 'DRAFT'
        ? '임시저장'
        : isClosed
          ? '제출 마감'
          : '제출 전';

  return (
    <section className="rounded-lg bg-white px-8 py-6">
      <h2 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        제출 정보
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-16 text-sm tracking-[-0.14px] max-sm:grid-cols-1 max-sm:gap-6">
        <div>
          <p className="leading-[1.4] font-medium text-neutral-900">제출 마감</p>
          <p className="mt-2 leading-[1.5] text-neutral-600">{formatDueAt(request.dueAt)}</p>
        </div>
        <div>
          <p className="leading-[1.4] font-medium text-neutral-900">제출 상태</p>
          <p className="mt-2 leading-[1.5] text-neutral-600">{statusText}</p>
        </div>
      </div>
    </section>
  );
}

function UnavailableSection() {
  return (
    <section className="mt-8 rounded-2xl bg-white px-8 py-9">
      <h2 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        제출 불가 상태
      </h2>
      <p className="mt-3 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
        제출 대상이 아니거나 제출 기간이 종료되었습니다.
      </p>
      <Link
        href="/portfolios"
        className="border-primary-300 text-primary-700 mt-6 inline-flex h-11 items-center justify-center rounded-lg border px-6 text-sm font-medium"
      >
        목록으로 돌아가기
      </Link>
    </section>
  );
}

function CompletedPortfolioMaterials({
  submission,
}: {
  submission: PortfolioSubmissionApiResponse | null;
}) {
  const handleDownload = async (file: PortfolioSubmissionApiResponse['files'][number]) => {
    try {
      const blob = await downloadCommonFile(file.fileId);
      savePortfolioFileBlob(blob, file.originalName);
    } catch {
      showToast({ tone: 'error', message: `${file.originalName} 다운로드에 실패했습니다.` });
    }
  };

  return (
    <section className="min-h-[420px] rounded-lg bg-white p-8">
      <h2 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        제출 자료
      </h2>
      {submission?.files.map((file) => (
        <button
          key={file.fileId}
          type="button"
          aria-label={`${file.originalName} 다운로드`}
          onClick={() => void handleDownload(file)}
          className="mt-4 flex min-h-[61px] items-center gap-3 rounded-lg border border-neutral-200 p-3"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
            <Icon name="file" className="h-[18.67px] w-[15.33px] text-neutral-600" />
          </span>
          <div>
            <p className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900">
              {file.originalName}
            </p>
            <p className="mt-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
              {formatFileSize(file.size)}
            </p>
          </div>
        </button>
      ))}

      {submission?.portfolioUrl ? (
        <>
          <h2 className="mt-8 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
            등록한 링크
          </h2>
          <a
            href={submission.portfolioUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex h-14 items-center gap-3 rounded-lg border border-neutral-200 px-4 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900"
          >
            <Icon name="externalLink" className="size-4 text-neutral-600" />
            {submission.portfolioUrl}
          </a>
        </>
      ) : null}
    </section>
  );
}

function formatFileSize(size: number): string {
  return `${Math.max(size / 1024 / 1024, 0.1).toFixed(1)} MB`;
}
