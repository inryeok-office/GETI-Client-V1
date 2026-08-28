import { describe, expect, it, vi } from 'vitest';

import type { DiscordDelivery } from '@/entities/discord-delivery';
import type { OperationJob } from '@/entities/scheduler';

import {
  buildDeveloperDashboardContent,
  type DeveloperDashboardMetrics,
  type FailureFeed,
} from './buildDeveloperDashboardContent';
import type { DashboardMetric } from './dashboardMetric';
import { DASHBOARD_CONTENT } from './mock';
import type { KpiCardData } from './types';

function metric<T>(overrides: Partial<DashboardMetric<T>> = {}): DashboardMetric<T> {
  return { data: undefined, isLoading: false, isError: false, onRetry: vi.fn(), ...overrides };
}

function feed<T>(count: number, items: T[]): FailureFeed<T> {
  return { count, items };
}

function delivery(overrides: Partial<DiscordDelivery> = {}): DiscordDelivery {
  return {
    deliveryId: 1,
    targetType: 'JOB',
    targetId: 1,
    targetName: '공고',
    action: 'CREATE',
    channelId: 'c',
    messageId: null,
    status: 'FAILED',
    automaticRetryCount: 0,
    maxAutomaticRetryCount: 3,
    manualRetryCount: 0,
    maxManualRetryCount: 3,
    canRetry: true,
    failureCode: 'TIMEOUT',
    failureReason: '전송 응답 시간 초과',
    requestedAt: '2026-08-27T10:31:00',
    lastSyncedAt: '2026-08-27T10:31:05',
    ...overrides,
  };
}

function job(overrides: Partial<OperationJob> = {}): OperationJob {
  return {
    taskId: 'PROGRAM_CLOSE',
    jobType: 'PROGRAM_CLOSE',
    name: '프로그램 마감',
    description: '',
    schedule: '',
    lastRunAt: '2026-08-27T09:58:00',
    nextRunAt: null,
    operationId: null,
    status: 'FAILED',
    processedCount: 0,
    successCount: 0,
    failureCount: 1,
    partialSuccessCount: 0,
    startedAt: null,
    finishedAt: null,
    lastError: '정기 작업 실행 실패',
    actionStatus: 'UNSUPPORTED',
    ...overrides,
  };
}

function fullMetrics(
  overrides: Partial<DeveloperDashboardMetrics> = {},
): DeveloperDashboardMetrics {
  return {
    discordFailures: metric<FailureFeed<DiscordDelivery>>({ data: feed(2, [delivery()]) }),
    failedJobs: metric<FailureFeed<OperationJob>>({ data: feed(5, [job()]) }),
    collectorFailureCount: metric<number>({ data: 4 }),
    errorInquiries: metric<number>({ data: 5 }),
    ...overrides,
  };
}

function card(cards: KpiCardData[], id: string): KpiCardData {
  const found = cards.find((item) => item.id === id);
  if (!found) throw new Error(`카드 없음: ${id}`);
  return found;
}

const BASE = DASHBOARD_CONTENT.developer;

describe('buildDeveloperDashboardContent', () => {
  it('"정상 시스템" KPI는 미지원으로 둔다', () => {
    const content = buildDeveloperDashboardContent(BASE, fullMetrics());
    expect(card(content.kpiCards, 'system').unsupported).toBe(true);
  });

  it('조회 성공 시 4개 운영 KPI를 실데이터로 채운다', () => {
    const content = buildDeveloperDashboardContent(BASE, fullMetrics());

    expect(card(content.kpiCards, 'discord').count).toBe('2건');
    expect(card(content.kpiCards, 'scheduler').count).toBe('5건');
    expect(card(content.kpiCards, 'collector').count).toBe('4건');
    expect(card(content.kpiCards, 'inquiries').count).toBe('5건');
  });

  it('최근 실패 내역 표는 Discord·정기 작업 실패를 시각 내림차순으로 병합한다', () => {
    const content = buildDeveloperDashboardContent(BASE, fullMetrics());

    expect(content.table.rows.map((row) => row.cells.map((cell) => cell.label))).toEqual([
      ['10:31', 'Discord', '전송 응답 시간 초과', '재시도'],
      ['09:58', '프로그램 마감', '정기 작업 실행 실패', '미처리'],
    ]);
  });

  it('실패 피드가 비면 emptyLabel을 노출한다', () => {
    const content = buildDeveloperDashboardContent(
      BASE,
      fullMetrics({
        discordFailures: metric<FailureFeed<DiscordDelivery>>({ data: feed(0, []) }),
        failedJobs: metric<FailureFeed<OperationJob>>({ data: feed(0, []) }),
      }),
    );

    expect(content.table.rows).toHaveLength(0);
    expect(content.table.emptyLabel).toBe('최근 실패 내역이 없습니다.');
    expect(content.table.isLoading).toBe(false);
  });

  it('두 피드가 모두 로딩 중이면 표는 isLoading이다', () => {
    const content = buildDeveloperDashboardContent(
      BASE,
      fullMetrics({
        discordFailures: metric<FailureFeed<DiscordDelivery>>({ isLoading: true }),
        failedJobs: metric<FailureFeed<OperationJob>>({ isLoading: true }),
      }),
    );

    expect(content.table.isLoading).toBe(true);
  });

  it('한쪽 피드만 실패하면 표는 에러가 아니라 남은 피드로 렌더한다', () => {
    const content = buildDeveloperDashboardContent(
      BASE,
      fullMetrics({
        discordFailures: metric<FailureFeed<DiscordDelivery>>({ isError: true }),
      }),
    );

    expect(content.table.hasError).toBe(false);
    expect(content.table.rows).toHaveLength(1);
    expect(content.table.rows[0].cells[1].label).toBe('프로그램 마감');
  });

  it('Discord 실패 조회가 에러면 해당 KPI만 에러 상태다', () => {
    const onRetry = vi.fn();
    const content = buildDeveloperDashboardContent(
      BASE,
      fullMetrics({
        discordFailures: metric<FailureFeed<DiscordDelivery>>({ isError: true, onRetry }),
      }),
    );

    expect(card(content.kpiCards, 'discord').loadState).toBe('error');
    expect(card(content.kpiCards, 'scheduler').loadState).toBeUndefined();
  });
});
