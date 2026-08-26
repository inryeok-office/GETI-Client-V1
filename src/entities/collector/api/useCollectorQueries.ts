'use client';

import { useEffect } from 'react';
import {
  keepPreviousData,
  queryOptions,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
  useQueries,
} from '@tanstack/react-query';

import type {
  ExecuteCollectorActionParams,
  FetchCollectorRunListParams,
  UpdateJobSourceParams,
} from '../model/types';
import { isCollectorRunInProgress } from '../model/mapCollectorRun';
import {
  executeAdminCollectorAction,
  fetchAdminCollectorRunDetail,
  fetchAdminCollectorRunList,
  fetchAdminJobSources,
  updateAdminJobSource,
} from './collectorApi';

const COLLECTOR_RUN_POLLING_INTERVAL_MS = 3_000;

export const collectorKeys = {
  all: ['collector'] as const,
  runs: () => [...collectorKeys.all, 'runs'] as const,
  details: () => [...collectorKeys.runs(), 'detail'] as const,
  detail: (runId: number) => [...collectorKeys.details(), runId] as const,
  lists: () => [...collectorKeys.runs(), 'list'] as const,
  list: (params: FetchCollectorRunListParams) => [...collectorKeys.lists(), params] as const,
  sources: () => [...collectorKeys.all, 'sources'] as const,
};

export function useAdminJobSourceListQuery() {
  return useQuery({
    queryKey: collectorKeys.sources(),
    queryFn: fetchAdminJobSources,
  });
}

export function useAdminCollectorRunListQuery(
  params: FetchCollectorRunListParams = {},
  { isEnabled = true }: { isEnabled?: boolean } = {},
) {
  return useQuery({
    enabled: isEnabled,
    queryKey: collectorKeys.list(params),
    queryFn: () => fetchAdminCollectorRunList(params),
    placeholderData: keepPreviousData,
    refetchInterval: (query) =>
      query.state.data?.content.some((run) => isCollectorRunInProgress(run.status))
        ? COLLECTOR_RUN_POLLING_INTERVAL_MS
        : false,
  });
}

export function useAdminCollectorRunDetailQuery(runId: number | null) {
  return useQuery({
    queryKey: collectorKeys.detail(runId ?? -1),
    queryFn: runId === null ? skipToken : () => fetchAdminCollectorRunDetail(runId),
    refetchInterval: (query) =>
      query.state.data && isCollectorRunInProgress(query.state.data.status)
        ? COLLECTOR_RUN_POLLING_INTERVAL_MS
        : false,
  });
}

export function useTrackAdminCollectorRuns(runIds: readonly number[]): void {
  const queryClient = useQueryClient();
  const runQueries = useQueries({
    queries: runIds.map((runId) =>
      queryOptions({
        queryKey: collectorKeys.detail(runId),
        queryFn: () => fetchAdminCollectorRunDetail(runId),
        refetchInterval: (query) =>
          query.state.data && isCollectorRunInProgress(query.state.data.status)
            ? COLLECTOR_RUN_POLLING_INTERVAL_MS
            : false,
      }),
    ),
  });
  const statusSignature = runQueries
    .map((query) => query.data?.status ?? (query.isError ? 'ERROR' : 'LOADING'))
    .join('|');
  const hasResolvedRun = runQueries.some((query) => query.data !== undefined);

  useEffect(() => {
    if (!hasResolvedRun) return;

    void queryClient.invalidateQueries({ queryKey: collectorKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: collectorKeys.sources() });
  }, [hasResolvedRun, queryClient, statusSignature]);
}

export function useUpdateAdminJobSourceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateJobSourceParams) => updateAdminJobSource(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: collectorKeys.all }),
  });
}

export function useExecuteAdminCollectorActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ExecuteCollectorActionParams) => executeAdminCollectorAction(params),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: collectorKeys.all }),
  });
}
