'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  mapCollectorRunDetail,
  mapCollectorRunSummary,
  useAdminCollectorRunDetailQuery,
  useAdminCollectorRunListQuery,
  useAdminJobSourceListQuery,
  useExecuteAdminCollectorActionMutation,
  useTrackAdminCollectorRuns,
  useUpdateAdminJobSourceMutation,
  type CollectorAction,
  type CollectorRunStatus,
} from '@/entities/collector';
import { ApiError } from '@/shared/api';
import { showToast } from '@/shared/ui/toast';
import {
  AdminCollectorManagement,
  type AdminCollectorDetailStatus,
  type AdminCollectorListStatus,
} from '@/widgets/admin-collector-management';

export interface AdminCollectorSearchParams {
  endDate?: string;
  page?: string;
  runId?: string;
  size?: string;
  sourceId?: string;
  startDate?: string;
  status?: string;
}

interface AdminCollectorManagementPageProps {
  initialSearchParams?: AdminCollectorSearchParams;
}

const DEFAULT_PAGE_SIZE = 5;
const MAX_PAGE_SIZE = 100;

const RUN_STATUSES: CollectorRunStatus[] = [
  'CANCELED',
  'FAILED',
  'PARTIAL_SUCCESS',
  'PENDING',
  'RUNNING',
  'SUCCESS',
];

export function AdminCollectorManagementPage({
  initialSearchParams = {},
}: AdminCollectorManagementPageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [action, setAction] = useState<CollectorAction>('COLLECT');
  const [endDate, setEndDate] = useState(() => parseDate(initialSearchParams.endDate));
  const [page, setPage] = useState(() => parsePage(initialSearchParams.page));
  const pageSize = parsePageSize(initialSearchParams.size);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(() =>
    parsePositiveInteger(initialSearchParams.runId),
  );
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>([]);
  const [trackedRunIds, setTrackedRunIds] = useState<number[]>([]);
  const [sourceId, setSourceId] = useState<number | null>(() =>
    parsePositiveInteger(initialSearchParams.sourceId),
  );
  const [startDate, setStartDate] = useState(() => parseDate(initialSearchParams.startDate));
  const [status, setStatus] = useState<CollectorRunStatus | 'ALL'>(() =>
    parseStatus(initialSearchParams.status),
  );

  const hasDateRangeError = Boolean(startDate && endDate && endDate < startDate);
  const sourceQuery = useAdminJobSourceListQuery();
  const listQuery = useAdminCollectorRunListQuery(
    {
      endAt: endDate && !hasDateRangeError ? `${endDate}T23:59:59.999999999` : undefined,
      page,
      size: pageSize,
      sourceId: sourceId ?? undefined,
      startAt: startDate && !hasDateRangeError ? `${startDate}T00:00:00` : undefined,
      status: status === 'ALL' ? undefined : status,
    },
    { isEnabled: !hasDateRangeError },
  );
  const detailQuery = useAdminCollectorRunDetailQuery(selectedRunId);
  const updateSourceMutation = useUpdateAdminJobSourceMutation();
  const executeActionMutation = useExecuteAdminCollectorActionMutation();
  useTrackAdminCollectorRuns(trackedRunIds);

  const runs = useMemo(
    () => (listQuery.data?.content ?? []).map(mapCollectorRunSummary),
    [listQuery.data?.content],
  );
  const selectedRun = detailQuery.data ? mapCollectorRunDetail(detailQuery.data) : null;
  const sources = useMemo(() => sourceQuery.data?.sources ?? [], [sourceQuery.data?.sources]);
  const selectedAvailableSourceIds = useMemo(() => {
    const availableSourceIds = new Set(sources.map((source) => source.sourceId));
    return selectedSourceIds.filter((selectedSourceId) => availableSourceIds.has(selectedSourceId));
  }, [selectedSourceIds, sources]);

  const listStatus: AdminCollectorListStatus = hasDateRangeError
    ? 'invalid'
    : listQuery.isLoading || listQuery.isPlaceholderData
      ? 'loading'
      : listQuery.isError
        ? 'error'
        : runs.length === 0
          ? 'empty'
          : 'success';
  const sourceStatus: AdminCollectorListStatus = sourceQuery.isLoading
    ? 'loading'
    : sourceQuery.isError
      ? 'error'
      : sources.length === 0
        ? 'empty'
        : 'success';
  const detailStatus: AdminCollectorDetailStatus =
    selectedRunId === null
      ? 'idle'
      : detailQuery.isLoading
        ? 'loading'
        : detailQuery.isError
          ? 'error'
          : 'success';

  useEffect(() => {
    if (hasDateRangeError) return;

    const params = new URLSearchParams();
    if (sourceId !== null) params.set('sourceId', String(sourceId));
    if (status !== 'ALL') params.set('status', status);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (page > 0) params.set('page', String(page + 1));
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set('size', String(pageSize));
    if (selectedRunId !== null) params.set('runId', String(selectedRunId));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [
    endDate,
    hasDateRangeError,
    page,
    pageSize,
    pathname,
    router,
    selectedRunId,
    sourceId,
    startDate,
    status,
  ]);

  useEffect(() => {
    if (!listQuery.data || listQuery.isPlaceholderData || listQuery.data.totalPages === 0) return;
    if (page < listQuery.data.totalPages) return;

    const timeoutId = window.setTimeout(() => setPage(listQuery.data.totalPages - 1), 0);
    return () => window.clearTimeout(timeoutId);
  }, [listQuery.data, listQuery.isPlaceholderData, page]);

  const handleToggleSourceSelection = (nextSourceId: number) => {
    if (
      sourceStatus !== 'success' ||
      updateSourceMutation.isPending ||
      executeActionMutation.isPending
    ) {
      return;
    }

    setSelectedSourceIds((currentIds) =>
      currentIds.includes(nextSourceId)
        ? currentIds.filter((currentId) => currentId !== nextSourceId)
        : [...currentIds, nextSourceId],
    );
  };

  const handleUpdateSource = (nextSourceId: number, enabled: boolean) => {
    if (
      sourceStatus !== 'success' ||
      updateSourceMutation.isPending ||
      executeActionMutation.isPending
    ) {
      return;
    }

    updateSourceMutation.mutate(
      { sourceId: nextSourceId, enabled },
      {
        onSuccess: () => showToast({ tone: 'success', message: '수집원 상태를 변경했습니다.' }),
        onError: (error) => showToast({ tone: 'error', message: getCollectorErrorMessage(error) }),
      },
    );
  };

  const handleExecuteAction = () => {
    if (
      sourceStatus !== 'success' ||
      selectedAvailableSourceIds.length === 0 ||
      updateSourceMutation.isPending ||
      executeActionMutation.isPending
    ) {
      return;
    }

    executeActionMutation.mutate(
      { action, sourceIds: selectedAvailableSourceIds },
      {
        onSuccess: (response) => {
          setSelectedSourceIds([]);
          setTrackedRunIds((currentRunIds) => [...new Set([...currentRunIds, ...response.runIds])]);
          setPage(0);
          showToast({ tone: 'success', message: '수집 작업을 요청했습니다.' });
        },
        onError: (error) => showToast({ tone: 'error', message: getCollectorErrorMessage(error) }),
      },
    );
  };

  const handleCloseDetail = useCallback(() => setSelectedRunId(null), []);

  return (
    <AdminCollectorManagement
      action={action}
      detailStatus={detailStatus}
      endDate={endDate}
      hasDateRangeError={hasDateRangeError}
      isActionPending={executeActionMutation.isPending}
      isSourceUpdatePending={updateSourceMutation.isPending}
      isDetailOpen={selectedRunId !== null}
      isFirstPage={listQuery.data?.first ?? true}
      isLastPage={listQuery.data?.last ?? true}
      listStatus={listStatus}
      page={page}
      pendingSourceId={
        updateSourceMutation.isPending ? updateSourceMutation.variables?.sourceId : undefined
      }
      runs={runs}
      selectedRun={selectedRun}
      selectedSourceIds={selectedAvailableSourceIds}
      sourceFilter={sourceId}
      sourceStatus={sourceStatus}
      sources={sources}
      startDate={startDate}
      statusFilter={status}
      totalPages={listQuery.data?.totalPages ?? 0}
      onActionChange={setAction}
      onCloseDetail={handleCloseDetail}
      onEndDateChange={(value) => {
        setEndDate(value);
        setPage(0);
      }}
      onExecuteAction={handleExecuteAction}
      onPageChange={setPage}
      onRetryDetail={() => void detailQuery.refetch()}
      onRetryList={() => void listQuery.refetch()}
      onRetrySources={() => void sourceQuery.refetch()}
      onSelectRun={setSelectedRunId}
      onSourceFilterChange={(value) => {
        setSourceId(value);
        setPage(0);
      }}
      onStartDateChange={(value) => {
        setStartDate(value);
        setPage(0);
      }}
      onStatusFilterChange={(value) => {
        setStatus(value);
        setPage(0);
      }}
      onToggleSource={handleUpdateSource}
      onToggleSourceSelection={handleToggleSourceSelection}
    />
  );
}

function parsePositiveInteger(value: string | undefined): number | null {
  const parsed = Number(value);
  return value && Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 1 ? parsed - 1 : 0;
}

function parsePageSize(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= MAX_PAGE_SIZE
    ? parsed
    : DEFAULT_PAGE_SIZE;
}

function parseDate(value: string | undefined): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return '';

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return '';
  }
  return match[0];
}

function parseStatus(value: string | undefined): CollectorRunStatus | 'ALL' {
  return RUN_STATUSES.includes(value as CollectorRunStatus) ? (value as CollectorRunStatus) : 'ALL';
}

function getCollectorErrorMessage(error: Error): string {
  if (!(error instanceof ApiError)) return '요청을 처리하지 못했습니다. 다시 시도해 주세요.';
  if (error.code === 'SOURCE_NOT_APPROVED') return '승인이 완료되지 않은 수집원입니다.';
  if (error.code === 'SOURCE_NOT_CONFIGURED') return '설정이 완료되지 않은 수집원입니다.';
  if (error.code === 'COLLECTOR_ALREADY_RUNNING') return '이미 실행 중인 수집원입니다.';
  if (error.code === 'JOB_SOURCE_NOT_FOUND') return '수집원을 찾을 수 없습니다.';
  return error.message || '요청을 처리하지 못했습니다. 다시 시도해 주세요.';
}
