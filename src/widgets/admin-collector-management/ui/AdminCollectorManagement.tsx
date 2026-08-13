'use client';

import { useEffect, useState } from 'react';

import type { CollectorRun, CollectorRunStatus } from '@/entities/collector';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

export type AdminCollectorListStatus = 'empty' | 'error' | 'loading' | 'success';

interface AdminCollectorManagementProps {
  initialSelectedRunId?: string;
  initialStatus: AdminCollectorListStatus;
  runs: CollectorRun[];
}

const STATUS_LABELS: Record<CollectorRunStatus, string> = {
  FAILED: '실패',
  PARTIAL_SUCCESS: '일부 실패',
  SUCCESS: '성공',
};

export function AdminCollectorManagement({
  initialSelectedRunId,
  initialStatus,
  runs,
}: AdminCollectorManagementProps) {
  const [listStatus, setListStatus] = useState(initialStatus);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(initialSelectedRunId ?? null);
  const selectedRun = runs.find((run) => run.runId === selectedRunId);

  useEffect(() => {
    if (!selectedRunId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedRunId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRunId]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminCollectorHeader />

      <main className="px-4 py-8 xl:px-6 xl:py-10 2xl:px-10">
        <div className="w-full max-w-[1620px]">
          <header>
            <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
              외부 수집 관리
            </h1>
            <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-700">
              외부 채용 사이트의 수집 실행 이력과 결과를 확인합니다.
            </p>
          </header>

          <section className="mt-6">
            <h2 className="px-1 text-base leading-[26px] tracking-[-0.16px] text-neutral-900">
              최근 수집 실행 이력
            </h2>

            <div className="mt-4">
              {listStatus === 'loading' ? <CollectorRunTableSkeleton /> : null}
              {listStatus === 'error' ? (
                <CollectorRunError onRetry={() => setListStatus('success')} />
              ) : null}
              {listStatus === 'empty' ? <CollectorRunEmpty /> : null}
              {listStatus === 'success' ? (
                <CollectorRunTable runs={runs} onSelectRun={setSelectedRunId} />
              ) : null}
            </div>
          </section>

          <p className="bg-primary-50 text-primary-800 mt-6 rounded-lg px-4 py-3 text-xs leading-[1.5] tracking-[-0.12px]">
            수집 결과는 실행 완료 후 자동으로 이력에 기록됩니다.
          </p>
        </div>
      </main>

      {selectedRun ? (
        <CollectorRunDetailPanel run={selectedRun} onClose={() => setSelectedRunId(null)} />
      ) : null}
    </div>
  );
}

function AdminCollectorHeader() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-4 xl:px-6 2xl:px-10">
      <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">외부 공고 수집</p>
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="bg-primary-100 size-8 shrink-0 rounded-full" aria-hidden="true" />
        <p className="text-sm leading-[1.5] tracking-[-0.14px] whitespace-nowrap text-neutral-600">
          개발자 · 외 1개
        </p>
        <Icon name="chevronRight" className="h-3 w-6 shrink-0 rotate-90 text-neutral-500" />
      </div>
    </header>
  );
}

function CollectorRunTable({
  onSelectRun,
  runs,
}: {
  onSelectRun: (runId: string) => void;
  runs: CollectorRun[];
}) {
  return (
    <div
      role="region"
      aria-label="수집 실행 이력"
      tabIndex={0}
      className="overflow-x-auto rounded-xl border border-neutral-200 bg-white"
    >
      <table className="w-[1620px] min-w-[1620px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[280px]" />
          <col className="w-[300px]" />
          <col className="w-[180px]" />
          <col className="w-[180px]" />
          <col className="w-[180px]" />
          <col className="w-[180px]" />
          <col className="w-[320px]" />
        </colgroup>
        <thead className="h-16 bg-neutral-50 text-neutral-600">
          <tr>
            {['출처', '실행 시각', '상태', '신규', '갱신', '실패', '오류 요약'].map((label) => (
              <th key={label} scope="col" className="px-5 font-medium">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-neutral-800">
          {runs.map((run) => {
            const hasErrors = run.errorSummary.length > 0;

            return (
              <tr key={run.runId} className="h-16">
                <td className="px-5">{run.sourceName}</td>
                <td className="px-5">{run.executedAt}</td>
                <td className="px-5">{STATUS_LABELS[run.status]}</td>
                <td className="px-5">{run.createdCount}건</td>
                <td className="px-5">{run.updatedCount}건</td>
                <td className="px-5">{run.failedCount}건</td>
                <td className="px-5">
                  {hasErrors ? (
                    <button
                      type="button"
                      onClick={() => onSelectRun(run.runId)}
                      className="text-primary-700 font-medium"
                    >
                      상세 보기
                    </button>
                  ) : (
                    <span className="text-neutral-900">오류 없음</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CollectorRunDetailPanel({ onClose, run }: { onClose: () => void; run: CollectorRun }) {
  return (
    <div className="fixed inset-y-0 right-0 left-[220px] z-40">
      <button
        type="button"
        aria-label="작업 실행 상세 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/25"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="collector-run-detail-title"
        className="absolute top-0 right-0 z-10 h-full w-[680px] max-w-full overflow-y-auto bg-white px-8 py-6"
      >
        <div className="flex items-center justify-between pb-1">
          <h2
            id="collector-run-detail-title"
            className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900"
          >
            작업 실행 상세
          </h2>
          <button
            type="button"
            aria-label="상세 패널 닫기"
            onClick={onClose}
            className="flex size-5 items-center justify-center"
          >
            <Icon name="close" className="size-[11.667px] text-neutral-900" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-1 px-1">
          <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-800">
            {run.sourceName}
          </p>
          <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
            {run.executedAt} · {STATUS_LABELS[run.status]}
          </p>
        </div>

        <div className="mt-6 flex gap-3 overflow-hidden">
          <RunCountCard label="신규" value={run.createdCount} />
          <RunCountCard label="갱신" value={run.updatedCount} />
          <RunCountCard isError label="실패" value={run.failedCount} />
        </div>

        <h3 className="mt-6 px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
          오류 요약
        </h3>
        <div className="mt-4 flex flex-col gap-3">
          {run.errorSummary.map((error) => (
            <div key={error.title} className="rounded-lg bg-neutral-50 p-5">
              <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                {error.title}
              </p>
              <p className="mt-2 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                {error.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 px-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-500">
          정상 처리된 공고는 서비스에 반영되었습니다.
        </p>
      </aside>
    </div>
  );
}

function RunCountCard({
  isError = false,
  label,
  value,
}: {
  isError?: boolean;
  label: string;
  value: number;
}) {
  return (
    <div className="h-[92px] w-[196px] shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 pt-4 pl-4">
      <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">{label}</p>
      <p
        className={`mt-2 text-base leading-[1.6] tracking-[-0.16px] ${
          isError ? 'text-status-error' : label === '신규' ? 'text-primary-700' : 'text-neutral-900'
        }`}
      >
        {value}건
      </p>
    </div>
  );
}

function CollectorRunTableSkeleton() {
  return (
    <div
      role="status"
      aria-label="수집 실행 이력을 불러오는 중"
      className="animate-pulse overflow-hidden rounded-xl border border-neutral-200 bg-white"
    >
      <div className="h-16 bg-neutral-100" />
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex h-16 items-center gap-12 px-5">
          <span className="h-4 w-28 rounded bg-neutral-100" />
          <span className="h-4 w-40 rounded bg-neutral-100" />
          <span className="h-4 w-20 rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

function CollectorRunError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      role="alert"
      className="flex min-h-[384px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white text-center"
    >
      <Icon name="alertCircleLarge" className="size-12 text-neutral-500" />
      <h2 className="mt-6 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        수집 이력을 불러올 수 없습니다.
      </h2>
      <p className="mt-3 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
        잠시 후 다시 시도해 주세요.
      </p>
      <Button className="mt-4" onClick={onRetry}>
        다시 시도
      </Button>
    </section>
  );
}

function CollectorRunEmpty() {
  return (
    <section className="flex min-h-[384px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white text-center">
      <Icon name="fileSearch" className="size-16 text-neutral-400" />
      <h2 className="mt-6 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        수집 실행 이력이 없습니다.
      </h2>
      <p className="mt-3 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
        수집 작업이 완료되면 실행 결과가 표시됩니다.
      </p>
    </section>
  );
}
