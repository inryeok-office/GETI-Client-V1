'use client';

import { useEffect } from 'react';

import {
  isCollectorRunInProgress,
  type CollectorAction,
  type CollectorRunDetail,
  type CollectorRunStatus,
  type CollectorRunSummary,
  type JobSourceApiItem,
} from '@/entities/collector';
import { Button } from '@/shared/ui/button';
import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';
import { AppToaster } from '@/shared/ui/toast';

export type AdminCollectorDetailStatus = 'error' | 'idle' | 'loading' | 'success';
export type AdminCollectorListStatus = 'empty' | 'error' | 'invalid' | 'loading' | 'success';

interface AdminCollectorManagementProps {
  action: CollectorAction;
  detailStatus: AdminCollectorDetailStatus;
  endDate: string;
  hasDateRangeError: boolean;
  isActionPending: boolean;
  isSourceUpdatePending: boolean;
  isDetailOpen: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  listStatus: AdminCollectorListStatus;
  onActionChange: (action: CollectorAction) => void;
  onCloseDetail: () => void;
  onEndDateChange: (value: string) => void;
  onExecuteAction: () => void;
  onPageChange: (page: number) => void;
  onRetryDetail: () => void;
  onRetryList: () => void;
  onRetrySources: () => void;
  onSelectRun: (runId: number) => void;
  onSourceFilterChange: (sourceId: number | null) => void;
  onStartDateChange: (value: string) => void;
  onStatusFilterChange: (status: CollectorRunStatus | 'ALL') => void;
  onToggleSource: (sourceId: number, enabled: boolean) => void;
  onToggleSourceSelection: (sourceId: number) => void;
  page: number;
  pendingSourceId?: number;
  runs: CollectorRunSummary[];
  selectedRun: CollectorRunDetail | null;
  selectedSourceIds: number[];
  sourceFilter: number | null;
  sourceStatus: AdminCollectorListStatus;
  sources: JobSourceApiItem[];
  startDate: string;
  statusFilter: CollectorRunStatus | 'ALL';
  totalPages: number;
}

const STATUS_LABELS: Record<CollectorRunStatus, string> = {
  CANCELED: '취소',
  FAILED: '실패',
  PARTIAL_SUCCESS: '일부 실패',
  PENDING: '대기 중',
  RUNNING: '실행 중',
  SUCCESS: '성공',
};

const ACTION_OPTIONS = [
  { label: '신규 공고 수집', value: 'COLLECT' },
  { label: '공고 상태 동기화', value: 'SYNC' },
] as const;

const STATUS_OPTIONS: ReadonlyArray<{ label: string; value: CollectorRunStatus | 'ALL' }> = [
  { label: '전체 상태', value: 'ALL' },
  { label: '대기 중', value: 'PENDING' },
  { label: '실행 중', value: 'RUNNING' },
  { label: '성공', value: 'SUCCESS' },
  { label: '일부 실패', value: 'PARTIAL_SUCCESS' },
  { label: '실패', value: 'FAILED' },
  { label: '취소', value: 'CANCELED' },
];

export function AdminCollectorManagement({
  action,
  detailStatus,
  endDate,
  hasDateRangeError,
  isActionPending,
  isSourceUpdatePending,
  isDetailOpen,
  isFirstPage,
  isLastPage,
  listStatus,
  onActionChange,
  onCloseDetail,
  onEndDateChange,
  onExecuteAction,
  onPageChange,
  onRetryDetail,
  onRetryList,
  onRetrySources,
  onSelectRun,
  onSourceFilterChange,
  onStartDateChange,
  onStatusFilterChange,
  onToggleSource,
  onToggleSourceSelection,
  page,
  pendingSourceId,
  runs,
  selectedRun,
  selectedSourceIds,
  sourceFilter,
  sourceStatus,
  sources,
  startDate,
  statusFilter,
  totalPages,
}: AdminCollectorManagementProps) {
  useEffect(() => {
    if (!isDetailOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseDetail();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailOpen, onCloseDetail]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminCollectorHeader />
      <AppToaster />

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

          <CollectorSourceSection
            action={action}
            isActionPending={isActionPending}
            isSourceUpdatePending={isSourceUpdatePending}
            pendingSourceId={pendingSourceId}
            selectedSourceIds={selectedSourceIds}
            sourceStatus={sourceStatus}
            sources={sources}
            onActionChange={onActionChange}
            onExecuteAction={onExecuteAction}
            onRetry={onRetrySources}
            onToggleSource={onToggleSource}
            onToggleSourceSelection={onToggleSourceSelection}
          />

          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="px-1 text-base leading-[26px] tracking-[-0.16px] text-neutral-900">
                수집 실행 이력
              </h2>
              <CollectorRunFilters
                endDate={endDate}
                hasDateRangeError={hasDateRangeError}
                sourceFilter={sourceFilter}
                sources={sources}
                startDate={startDate}
                statusFilter={statusFilter}
                onEndDateChange={onEndDateChange}
                onSourceFilterChange={onSourceFilterChange}
                onStartDateChange={onStartDateChange}
                onStatusFilterChange={onStatusFilterChange}
              />
            </div>

            <div className="mt-4">
              {listStatus === 'loading' ? <CollectorRunTableSkeleton /> : null}
              {listStatus === 'error' ? <CollectorRunError onRetry={onRetryList} /> : null}
              {listStatus === 'invalid' ? <CollectorRunInvalidDate /> : null}
              {listStatus === 'empty' ? <CollectorRunEmpty /> : null}
              {listStatus === 'success' ? (
                <CollectorRunTable runs={runs} onSelectRun={onSelectRun} />
              ) : null}
            </div>
            {listStatus === 'success' && totalPages > 1 ? (
              <CollectorRunPagination
                currentPage={page}
                isFirst={isFirstPage}
                isLast={isLastPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            ) : null}
          </section>

          <p className="bg-primary-50 text-primary-800 mt-6 rounded-lg px-4 py-3 text-xs leading-[1.5] tracking-[-0.12px]">
            수집 결과는 실행 완료 후 자동으로 이력에 기록됩니다.
          </p>
        </div>
      </main>

      {isDetailOpen ? (
        <CollectorRunDetailPanel
          detailStatus={detailStatus}
          run={selectedRun}
          onClose={onCloseDetail}
          onRetry={onRetryDetail}
        />
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

function CollectorSourceSection({
  action,
  isActionPending,
  isSourceUpdatePending,
  onActionChange,
  onExecuteAction,
  onRetry,
  onToggleSource,
  onToggleSourceSelection,
  pendingSourceId,
  selectedSourceIds,
  sourceStatus,
  sources,
}: {
  action: CollectorAction;
  isActionPending: boolean;
  isSourceUpdatePending: boolean;
  onActionChange: (action: CollectorAction) => void;
  onExecuteAction: () => void;
  onRetry: () => void;
  onToggleSource: (sourceId: number, enabled: boolean) => void;
  onToggleSourceSelection: (sourceId: number) => void;
  pendingSourceId?: number;
  selectedSourceIds: number[];
  sourceStatus: AdminCollectorListStatus;
  sources: JobSourceApiItem[];
}) {
  const isControlDisabled = sourceStatus !== 'success' || isActionPending || isSourceUpdatePending;

  return (
    <section className="mt-8" aria-labelledby="collector-source-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id="collector-source-title"
            className="px-1 text-base leading-[26px] tracking-[-0.16px] text-neutral-900"
          >
            수집원 설정
          </h2>
          <p className="mt-1 px-1 text-xs leading-[1.5] text-neutral-600">
            실행할 수집원을 선택하고 수동 수집 또는 상태 동기화를 요청할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownField
            ariaLabel="실행 종류"
            className="w-[210px]"
            controlClassName="h-11"
            disabled={isControlDisabled}
            onChange={(value) => onActionChange(value as CollectorAction)}
            options={ACTION_OPTIONS}
            placeholder="실행 종류"
            value={action}
          />
          <Button
            disabled={isControlDisabled || selectedSourceIds.length === 0}
            isLoading={isActionPending}
            onClick={onExecuteAction}
          >
            선택 수집원 실행
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {sourceStatus === 'loading' ? <CollectorSourceTableSkeleton /> : null}
        {sourceStatus === 'error' ? (
          <CollectorSourceState
            isError
            title="수집원 정보를 불러올 수 없습니다."
            description="잠시 후 다시 시도해 주세요."
            onRetry={onRetry}
          />
        ) : null}
        {sourceStatus === 'empty' ? (
          <CollectorSourceState
            title="등록된 수집원이 없습니다."
            description="서버에 수집원이 등록되면 이곳에 표시됩니다."
          />
        ) : null}
        {sourceStatus === 'success' ? (
          <div
            role="region"
            aria-label="수집원 설정 목록"
            tabIndex={0}
            className="overflow-x-auto rounded-xl border border-neutral-200 bg-white"
          >
            <table className="w-full min-w-[1080px] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[72px]" />
                <col className="w-[240px]" />
                <col className="w-[190px]" />
                <col className="w-[180px]" />
                <col className="w-[180px]" />
                <col className="w-[180px]" />
              </colgroup>
              <thead className="h-14 bg-neutral-50 text-neutral-600">
                <tr>
                  <th scope="col" className="px-5 font-medium">
                    선택
                  </th>
                  <th scope="col" className="px-5 font-medium">
                    수집원
                  </th>
                  <th scope="col" className="px-5 font-medium">
                    승인 상태
                  </th>
                  <th scope="col" className="px-5 font-medium">
                    설정 상태
                  </th>
                  <th scope="col" className="px-5 font-medium">
                    마지막 성공
                  </th>
                  <th scope="col" className="px-5 font-medium">
                    활성 상태
                  </th>
                </tr>
              </thead>
              <tbody className="text-neutral-800">
                {sources.map((source) => (
                  <tr key={source.sourceId} className="h-16 border-t border-neutral-100">
                    <td className="px-5">
                      <input
                        type="checkbox"
                        aria-label={`${source.name} 실행 대상 선택`}
                        checked={selectedSourceIds.includes(source.sourceId)}
                        disabled={isControlDisabled}
                        onChange={() => onToggleSourceSelection(source.sourceId)}
                        className="accent-primary-700 size-4"
                      />
                    </td>
                    <td className="px-5">
                      <p className="font-medium text-neutral-900">{source.name}</p>
                      <p className="mt-1 text-xs text-neutral-500">{source.sourceCode}</p>
                    </td>
                    <td className="px-5">{formatApprovalStatus(source.approvalStatus)}</td>
                    <td className="px-5">{source.configured ? '설정 완료' : '설정 필요'}</td>
                    <td className="px-5">{formatOptionalDate(source.lastSuccessAt)}</td>
                    <td className="px-5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={source.enabled}
                        aria-label={`${source.name} 활성 상태`}
                        disabled={isControlDisabled || pendingSourceId !== undefined}
                        onClick={() => onToggleSource(source.sourceId, !source.enabled)}
                        className={`relative h-7 w-12 rounded-full transition-colors disabled:opacity-50 ${
                          source.enabled ? 'bg-primary-700' : 'bg-neutral-300'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute top-1 size-5 rounded-full bg-white transition-transform ${
                            source.enabled ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CollectorRunFilters({
  endDate,
  hasDateRangeError,
  onEndDateChange,
  onSourceFilterChange,
  onStartDateChange,
  onStatusFilterChange,
  sourceFilter,
  sources,
  startDate,
  statusFilter,
}: {
  endDate: string;
  hasDateRangeError: boolean;
  onEndDateChange: (value: string) => void;
  onSourceFilterChange: (sourceId: number | null) => void;
  onStartDateChange: (value: string) => void;
  onStatusFilterChange: (status: CollectorRunStatus | 'ALL') => void;
  sourceFilter: number | null;
  sources: JobSourceApiItem[];
  startDate: string;
  statusFilter: CollectorRunStatus | 'ALL';
}) {
  const sourceOptions = [
    { label: '전체 수집원', value: 'ALL' },
    ...sources.map((source) => ({ label: source.name, value: String(source.sourceId) })),
  ];

  return (
    <div className="flex flex-wrap items-start justify-end gap-3">
      <DropdownField
        ariaLabel="수집원 필터"
        className="w-[180px]"
        controlClassName="h-11"
        onChange={(value) => onSourceFilterChange(value === 'ALL' ? null : Number(value))}
        options={sourceOptions}
        placeholder="전체 수집원"
        value={sourceFilter === null ? 'ALL' : String(sourceFilter)}
      />
      <DropdownField
        ariaLabel="실행 상태 필터"
        className="w-[170px]"
        controlClassName="h-11"
        onChange={(value) => onStatusFilterChange(value as CollectorRunStatus | 'ALL')}
        options={STATUS_OPTIONS}
        placeholder="전체 상태"
        value={statusFilter}
      />
      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        <span>기간 시작</span>
        <input
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          className="focus:border-primary-300 h-11 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        <span>기간 종료</span>
        <input
          type="date"
          aria-invalid={hasDateRangeError || undefined}
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          className={`focus:border-primary-300 h-11 rounded-lg border bg-white px-3 text-sm text-neutral-900 outline-none ${
            hasDateRangeError ? 'border-status-error' : 'border-neutral-200'
          }`}
        />
      </label>
    </div>
  );
}

function CollectorRunPagination({
  currentPage,
  isFirst,
  isLast,
  onPageChange,
  totalPages,
}: {
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
  onPageChange: (page: number) => void;
  totalPages: number;
}) {
  return (
    <nav aria-label="수집 실행 이력 페이지" className="mt-6 flex items-center justify-center gap-3">
      <Button variant="neutral" disabled={isFirst} onClick={() => onPageChange(currentPage - 1)}>
        이전
      </Button>
      <p className="text-sm text-neutral-700">
        {currentPage + 1} / {totalPages}
      </p>
      <Button variant="neutral" disabled={isLast} onClick={() => onPageChange(currentPage + 1)}>
        다음
      </Button>
    </nav>
  );
}

function CollectorRunTable({
  onSelectRun,
  runs,
}: {
  onSelectRun: (runId: number) => void;
  runs: CollectorRunSummary[];
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
          {runs.map((run) => (
            <tr key={run.runId} className="h-16">
              <td className="px-5">{run.sourceName}</td>
              <td className="px-5">{run.executedAt}</td>
              <td className="px-5">{STATUS_LABELS[run.status]}</td>
              <td className="px-5">{formatRunCount(run.createdCount)}</td>
              <td className="px-5">{formatRunCount(run.updatedCount)}</td>
              <td className="px-5">{formatRunCount(run.failedCount)}</td>
              <td className="px-5">
                {run.hasErrors || isCollectorRunInProgress(run.status) ? (
                  <button
                    type="button"
                    onClick={() => onSelectRun(run.runId)}
                    className="text-primary-700 font-medium"
                  >
                    상세 보기
                  </button>
                ) : run.status === 'CANCELED' ? (
                  <span className="text-neutral-900">취소됨</span>
                ) : (
                  <span className="text-neutral-900">오류 없음</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CollectorRunDetailPanel({
  detailStatus,
  onClose,
  onRetry,
  run,
}: {
  detailStatus: AdminCollectorDetailStatus;
  onClose: () => void;
  onRetry: () => void;
  run: CollectorRunDetail | null;
}) {
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

        {detailStatus === 'loading' || detailStatus === 'idle' ? (
          <CollectorRunDetailSkeleton />
        ) : null}
        {detailStatus === 'error' ? <CollectorRunDetailError onRetry={onRetry} /> : null}
        {detailStatus === 'success' && run ? <CollectorRunDetailContent run={run} /> : null}
      </aside>
    </div>
  );
}

function CollectorRunDetailContent({ run }: { run: CollectorRunDetail }) {
  return (
    <>
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
      {run.errorSummary.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {run.errorSummary.map((error, index) => (
            <div key={`${error.title}-${index}`} className="rounded-lg bg-neutral-50 p-5">
              <p className="text-base leading-[1.6] tracking-[-0.16px] break-words text-neutral-900">
                {error.title}
              </p>
              <p className="mt-2 text-xs leading-[1.5] tracking-[-0.12px] break-words text-neutral-600">
                {error.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-neutral-50 p-5 text-sm text-neutral-600">
          기록된 오류 상세가 없습니다.
        </p>
      )}

      <CollectorRunDetailNotice status={run.status} />
    </>
  );
}

function CollectorRunDetailNotice({ status }: { status: CollectorRunStatus }) {
  const message = isCollectorRunInProgress(status)
    ? '작업이 진행 중이며 완료될 때까지 자동으로 갱신됩니다.'
    : status === 'CANCELED'
      ? '작업이 취소되었습니다.'
      : '정상 처리된 공고는 서비스에 반영되었습니다.';

  return (
    <p className="mt-6 px-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-500">{message}</p>
  );
}

function RunCountCard({
  isError = false,
  label,
  value,
}: {
  isError?: boolean;
  label: string;
  value: number | null;
}) {
  return (
    <div className="h-[92px] w-[196px] shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 pt-4 pl-4">
      <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">{label}</p>
      <p
        className={`mt-2 text-base leading-[1.6] tracking-[-0.16px] ${
          isError ? 'text-status-error' : label === '신규' ? 'text-primary-700' : 'text-neutral-900'
        }`}
      >
        {formatRunCount(value)}
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

function CollectorSourceTableSkeleton() {
  return (
    <div
      role="status"
      aria-label="수집원 정보를 불러오는 중"
      className="animate-pulse overflow-hidden rounded-xl border border-neutral-200 bg-white"
    >
      <div className="h-14 bg-neutral-100" />
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex h-16 items-center gap-12 px-5">
          <span className="h-4 w-4 rounded bg-neutral-100" />
          <span className="h-4 w-36 rounded bg-neutral-100" />
          <span className="h-4 w-24 rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

function CollectorSourceState({
  description,
  isError = false,
  onRetry,
  title,
}: {
  description: string;
  isError?: boolean;
  onRetry?: () => void;
  title: string;
}) {
  return (
    <section
      role={isError ? 'alert' : undefined}
      className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white text-center"
    >
      <Icon
        name={isError ? 'alertCircleLarge' : 'fileSearch'}
        className="size-12 text-neutral-500"
      />
      <h3 className="mt-5 text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
      {onRetry ? (
        <Button className="mt-4" onClick={onRetry}>
          다시 시도
        </Button>
      ) : null}
    </section>
  );
}

function CollectorRunDetailSkeleton() {
  return (
    <div role="status" aria-label="작업 실행 상세를 불러오는 중" className="mt-6 animate-pulse">
      <div className="h-6 w-28 rounded bg-neutral-100" />
      <div className="mt-2 h-4 w-52 rounded bg-neutral-100" />
      <div className="mt-6 flex gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-[92px] w-[196px] rounded-lg bg-neutral-100" />
        ))}
      </div>
      <div className="mt-6 h-6 w-20 rounded bg-neutral-100" />
      <div className="mt-4 h-24 rounded-lg bg-neutral-100" />
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

function CollectorRunDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      role="alert"
      className="flex min-h-[360px] flex-col items-center justify-center text-center"
    >
      <Icon name="alertCircleLarge" className="size-12 text-neutral-500" />
      <h3 className="mt-6 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        작업 실행 상세를 불러올 수 없습니다.
      </h3>
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

function CollectorRunInvalidDate() {
  return (
    <section className="flex min-h-[384px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white text-center">
      <Icon name="alertCircleLarge" className="size-12 text-neutral-500" />
      <h2 className="mt-6 text-xl leading-[1.4] font-semibold text-neutral-900">
        조회 기간을 확인해 주세요.
      </h2>
      <p className="mt-3 text-base leading-[1.6] text-neutral-600">
        종료일은 시작일보다 빠를 수 없습니다.
      </p>
    </section>
  );
}

function formatRunCount(count: number | null): string {
  return count === null ? '-' : `${count}건`;
}

function formatApprovalStatus(status: JobSourceApiItem['approvalStatus']): string {
  if (status === 'READY') return '사용 가능';
  if (status === 'PENDING_APPROVAL') return '승인 대기';
  return '사용 불가';
}

function formatOptionalDate(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}
