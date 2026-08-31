import { formatDeliveryDateTimeShort, type DiscordDelivery } from '@/entities/discord-delivery';
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

/**
 * Discord 실패는 최근 24시간으로 잘리지만 정기 작업은 마지막 실행이 실패면 며칠 전 것도 들어온다.
 * 시:분만 보이면 오래된 실패가 오늘 것처럼 보여서(PR #186 리뷰), 날짜까지 표시한다.
 */
function timeLabel(timestamp: string | null): string {
  return timestamp ? formatDeliveryDateTimeShort(timestamp) : '—';
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

/** 아직 데이터도 에러도 없는(로딩 중이거나 첫 조회 전) 피드인지. */
function isFeedPending(metric: DashboardMetric<unknown>): boolean {
  return !metric.isError && (metric.isLoading || metric.data === undefined);
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

  const discordFailed = metrics.discordFailures.isError;
  const jobsFailed = metrics.failedJobs.isError;
  const feedError = discordFailed && jobsFailed;
  const feedLoading = isFeedPending(metrics.discordFailures) && isFeedPending(metrics.failedJobs);

  // 한쪽 소스만 실패하면 표 전체를 에러로 덮지 않고, 남은 소스를 렌더하면서 부분 실패를 알린다
  // (system/jobs 403 등 — PR #186 리뷰).
  let noticeLabel: string | undefined;
  if (!feedError && discordFailed) {
    noticeLabel = 'Discord 전달 내역을 불러오지 못해 정기 작업 실패만 표시합니다.';
  } else if (!feedError && jobsFailed) {
    noticeLabel = '정기 작업 내역을 불러오지 못해 Discord 전달 실패만 표시합니다.';
  }

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
    noticeLabel,
  };

  return { ...base, kpiCards, table };
}
