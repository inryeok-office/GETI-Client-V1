'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import {
  AI_DIFFICULTY_LABEL,
  AI_FIT_SHORT_LABEL,
  EMPTY_CELL,
  formatAiAnalysisSummary,
  formatDateTimeMinute,
  formatJobDeadlineState,
  formatJobPublicState,
  useAdminJobDetailQuery,
  useReanalyzeAdminJobMutation,
  type AdminJobDetail,
} from '@/entities/job';
import { Icon } from '@/shared/ui/icon';
import { PageState } from '@/shared/ui/page-state';
import { AppToaster, showToast } from '@/shared/ui/toast';

interface AdminJobDetailPageProps {
  jobId: string;
  /**
   * "← 공고 관리" 브레드크럼이 돌아갈 경로. Server Component가 현재 URL의 검색·필터·페이지
   * 쿼리스트링을 이어 붙여 넘겨줘, 목록에서 들어온 조회 조건이 복귀 시 유지된다(PR #203 코드리뷰 반영).
   */
  backHref?: string;
}

/**
 * 어드민 공고 상세 화면(`/admin/jobs/[jobId]`). `GET /api/v1/admin/jobs/{jobId}`
 * (`entities/job`의 `useAdminJobDetailQuery`)로 모든 상태(임시저장·삭제 포함)의 공고를
 * 조회한다(Issue #202). 라우트 파라미터가 정수가 아니거나 조회가 실패하면
 * (404 공고 없음, 403 권한 없음 포함) 오류 상태를 보여준다 — `AdminCompanyDetailPage`와 같은 패턴.
 * `AppToaster`는 등록·수정 후 이 화면으로 이동해 오는 성공 토스트를 그리기 위해 둔다(Issue #205).
 * "AI 재분석"은 `POST /api/v1/jobs/{jobId}/ai-reanalysis`에 연동한다(Issue #206) — 접수만 되고
 * 실제 결과는 비동기라, 성공 시 상세를 다시 불러온다.
 * 간격·색상은 Figma(node 586:12852)를 옮겼다.
 */
export function AdminJobDetailPage({ jobId, backHref = '/admin/jobs' }: AdminJobDetailPageProps) {
  const numericId = Number(jobId);
  const isValidId = Number.isInteger(numericId);

  const detailQuery = useAdminJobDetailQuery(isValidId ? numericId : null);
  const reanalyzeMutation = useReanalyzeAdminJobMutation();

  const detail = detailQuery.data;
  const isError = !isValidId || detailQuery.isError;

  function handleReanalyze() {
    if (!detail) return;
    reanalyzeMutation.mutate(detail.jobId, {
      onSuccess: () =>
        showToast({
          tone: 'success',
          message: 'AI 재분석을 요청했습니다. 잠시 후 결과가 갱신됩니다.',
        }),
      onError: (error) => showToast({ tone: 'error', message: error.message }),
    });
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppToaster />
      <header className="flex h-[80px] items-center justify-between border-b border-neutral-200 bg-white px-[40px]">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-900">공고 상세</p>
        <div className="flex items-center gap-[12px]">
          <span className="bg-primary-100 size-[32px] rounded-full" aria-hidden="true" />
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-600">
            개발자 · 외 1개
          </p>
          <Icon name="chevronRight" className="h-[12px] w-[24px] rotate-90 text-neutral-600" />
        </div>
      </header>

      <main className="flex flex-col gap-[24px] px-[40px] py-[40px]">
        <Link
          href={backHref}
          className="text-primary-700 flex w-fit items-center gap-[4px] text-[14px] leading-[1.5] tracking-[-0.14px]"
        >
          <Icon name="chevronRight" className="size-[16px] rotate-180" />
          공고 관리
        </Link>

        {isError ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-[16px] rounded-[12px] border border-neutral-200 bg-white">
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
        ) : detailQuery.isLoading || !detail ? (
          <div className="min-h-[360px] rounded-[12px] border border-neutral-200 bg-white">
            <PageState
              variant="loading"
              title="공고 정보를 불러오는 중입니다."
              description="잠시만 기다려 주세요."
            />
          </div>
        ) : (
          <AdminJobDetailContent
            detail={detail}
            isReanalyzing={reanalyzeMutation.isPending}
            onReanalyze={handleReanalyze}
          />
        )}
      </main>
    </div>
  );
}

function AdminJobDetailContent({
  detail,
  isReanalyzing,
  onReanalyze,
}: {
  detail: AdminJobDetail;
  isReanalyzing: boolean;
  onReanalyze: () => void;
}) {
  const deadlineState = formatJobDeadlineState(detail.status);
  const subtitle = [detail.company?.name, formatJobPublicState(detail.status), deadlineState]
    .filter((part): part is string => Boolean(part))
    .join(' · ');

  const analysis = detail.aiAnalysis;
  const requiredSkills = analysis?.requiredSkills.map((skill) => skill.name).join(' · ');

  return (
    <>
      <div className="flex flex-col gap-[16px]">
        <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
          {detail.title}
        </h1>
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-600">{subtitle}</p>
      </div>

      {detail.status === 'DELETED' && (
        <p className="rounded-[8px] bg-neutral-100 px-[16px] py-[12px] text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-600">
          삭제된 공고입니다. 목록에는 나타나지 않으며 이력 확인용으로만 조회됩니다.
        </p>
      )}

      <div className="flex flex-col items-start gap-[24px] xl:flex-row">
        <section className="flex w-full flex-col gap-[24px] rounded-[12px] border border-neutral-200 bg-white p-[24px] xl:max-w-[960px] xl:flex-1">
          <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
            공고 정보
          </h2>
          <DetailField label="공고 내용">
            <p className="text-[14px] leading-[1.5] whitespace-pre-wrap text-neutral-700">
              {detail.content?.trim() || '등록된 공고 내용이 없습니다.'}
            </p>
          </DetailField>
          <DetailField label="필수 기술">
            <p className="text-[14px] leading-[1.5] text-neutral-700">
              {requiredSkills || EMPTY_CELL}
            </p>
          </DetailField>
          <DetailField label="마지막 수정">
            <p className="text-[14px] leading-[1.5] text-neutral-700">
              {detail.updatedAt ? formatDateTimeMinute(detail.updatedAt) : EMPTY_CELL}
            </p>
          </DetailField>
        </section>

        <section className="flex w-full flex-col gap-[16px] rounded-[12px] border border-neutral-200 bg-white p-[24px] xl:w-[620px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-900">
              AI 공고 분석
            </h2>
            {analysis && (
              <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-neutral-600">
                남은 재분석 {analysis.remainingReanalysisCount}회
              </p>
            )}
          </div>

          <p className="text-primary-700 text-[12px] leading-[1.5] tracking-[-0.12px]">
            {formatAiAnalysisSummary(analysis?.status ?? null, analysis?.analyzedAt ?? null)}
          </p>

          {analysis ? (
            <>
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-700">
                공고 내용을 수정한 경우 AI 분석을 다시 실행할 수 있습니다. 분석 중에는 중복 요청할
                수 없습니다.
              </p>

              {analysis.status === 'COMPLETED' && (
                <div className="flex gap-[20px]">
                  <AiResultItem
                    label="고졸 지원"
                    value={
                      analysis.highSchoolGraduateFit
                        ? AI_FIT_SHORT_LABEL[analysis.highSchoolGraduateFit]
                        : EMPTY_CELL
                    }
                  />
                  <AiResultItem
                    label="신입 지원"
                    value={
                      analysis.entryLevelFit
                        ? AI_FIT_SHORT_LABEL[analysis.entryLevelFit]
                        : EMPTY_CELL
                    }
                  />
                  <AiResultItem
                    label="난이도"
                    value={
                      analysis.difficulty ? AI_DIFFICULTY_LABEL[analysis.difficulty] : EMPTY_CELL
                    }
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-700">
              공고가 게시되면 AI가 자동으로 분석합니다.
            </p>
          )}

          <button
            type="button"
            disabled={!analysis?.canReanalyze || isReanalyzing}
            onClick={onReanalyze}
            title={
              analysis?.canReanalyze
                ? undefined
                : '지금은 AI 재분석을 요청할 수 없습니다(분석 진행 중이거나 횟수 소진).'
            }
            className="bg-primary-700 mt-[8px] flex w-fit items-center justify-center rounded-[8px] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isReanalyzing ? '요청 중…' : 'AI 재분석'}
          </button>
        </section>
      </div>
    </>
  );
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900">
        {label}
      </p>
      {children}
    </div>
  );
}

function AiResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[4px]">
      <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-neutral-600">{label}</p>
      <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900">
        {value}
      </p>
    </div>
  );
}
