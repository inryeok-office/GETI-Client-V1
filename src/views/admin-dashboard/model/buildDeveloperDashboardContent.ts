import type { DiscordDelivery } from '@/entities/discord-delivery';
import type { OperationJob } from '@/entities/scheduler';

import { applyCountMetric, type DashboardMetric } from './dashboardMetric';
import type { DashboardContent, DashboardTableRow } from './types';

export type { DashboardMetric } from './dashboardMetric';

/** KPI 건수와 "최근 실패 내역" 표 행을 함께 주는 지표. */
export interface FailureFeed<T> {
  count: number;
  items: T[];
}

export interface DeveloperDashboardMetrics {
  /** 최근 24시간 Discord 전송 실패. */
  discordFailures: DashboardMetric<FailureFeed<DiscordDelivery>>;
  /** 실패 상태인 정기 작업. */
  failedJobs: DashboardMetric<FailureFeed<OperationJob>>;
  /** 외부 공고 수집 작업의 누적 실패 횟수. */
  collectorFailureCount: DashboardMetric<number>;
  /** 미처리(미답변) 오류 유형 문의 건수. */
  errorInquiries: DashboardMetric<number>;
}

const MAX_FAILURE_ROWS = 5;

function timeLabel(timestamp: string | null): string {
  return timestamp ? timestamp.slice(11, 16) : '—';
}

interface FailureRow {
  id: string;
  sortKey: string;
  category: string;
  detail: string;
  retryable: boolean;
  timestamp: string | null;
}

function discordRow(delivery: DiscordDelivery): FailureRow {
  const timestamp = delivery.lastSyncedAt ?? delivery.requestedAt;
  return {
    id: `discord-${delivery.deliveryId}`,
    sortKey: timestamp ?? '',
    category: 'Discord',
    detail: delivery.failureReason ?? delivery.failureCode ?? '전송 실패',
    retryable: delivery.canRetry,
    timestamp,
  };
}

function jobRow(job: OperationJob): FailureRow {
  return {
    id: `job-${job.jobType}`,
    sortKey: job.lastRunAt ?? '',
    category: job.name,
    detail: job.lastError ?? '실행 실패',
    retryable: job.actionStatus === 'SUPPORTED',
    timestamp: job.lastRunAt,
  };
}

function buildFailureRows(metrics: DeveloperDashboardMetrics): DashboardTableRow[] {
  const discordItems = metrics.discordFailures.data?.items ?? [];
  const jobItems = metrics.failedJobs.data?.items ?? [];

  return [...discordItems.map(discordRow), ...jobItems.map(jobRow)]
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
    .slice(0, MAX_FAILURE_ROWS)
    .map((row) => ({
      id: row.id,
      cells: [
        { label: timeLabel(row.timestamp) },
        { label: row.category },
        { label: row.detail },
        row.retryable
          ? { label: '재시도', variant: 'badge' as const, tone: 'warning' as const }
          : { label: '미처리', variant: 'badge' as const, tone: 'danger' as const },
      ],
    }));
}

/**
 * Mock `DASHBOARD_CONTENT.developer`를 base로, 연동 가능한 운영 지표를 실데이터로 치환한다
 * (Issue #183). "정상 시스템" KPI는 판정 기준·API가 없어 "미지원"으로 둔다. 알림 사이드바는
 * activity-feed API가 없어 Mock 유지.
 */
export function buildDeveloperDashboardContent(
  base: DashboardContent,
  metrics: DeveloperDashboardMetrics,
): DashboardContent {
  const kpiCards = base.kpiCards.map((card) => {
    switch (card.id) {
      case 'discord':
        return applyCountMetric(card, {
          ...metrics.discordFailures,
          data: metrics.discordFailures.data?.count,
        });
      case 'scheduler':
        return applyCountMetric(card, {
          ...metrics.failedJobs,
          data: metrics.failedJobs.data?.count,
        });
      case 'collector':
        return applyCountMetric(card, metrics.collectorFailureCount);
      case 'inquiries':
        return applyCountMetric(card, metrics.errorInquiries);
      case 'system':
        return { ...card, unsupported: true };
      default:
        return card;
    }
  });

  const feedLoading =
    (metrics.discordFailures.isLoading || metrics.discordFailures.data === undefined) &&
    (metrics.failedJobs.isLoading || metrics.failedJobs.data === undefined);
  const feedError = metrics.discordFailures.isError && metrics.failedJobs.isError;

  const table: DashboardContent['table'] = {
    ...base.table,
    rows: buildFailureRows(metrics),
    isLoading: feedLoading,
    hasError: feedError,
    onRetry: () => {
      metrics.discordFailures.onRetry();
      metrics.failedJobs.onRetry();
    },
    emptyLabel: '최근 실패 내역이 없습니다.',
  };

  return { ...base, kpiCards, table };
}
