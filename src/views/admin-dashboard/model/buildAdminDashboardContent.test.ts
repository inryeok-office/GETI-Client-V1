import { describe, expect, it, vi } from 'vitest';

import type { ApplicationStatusCounts } from '@/entities/applicant';
import type { NotificationApiItem } from '@/entities/notification';

import {
  buildAdminDashboardContent,
  type AdminDashboardMetrics,
} from './buildAdminDashboardContent';
import type { DashboardMetric } from './dashboardMetric';
import { DASHBOARD_CONTENT } from './mock';
import type { KpiCardData } from './types';

function metric<T>(overrides: Partial<DashboardMetric<T>> = {}): DashboardMetric<T> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    onRetry: vi.fn(),
    ...overrides,
  };
}

function notificationItem(overrides: Partial<NotificationApiItem> = {}): NotificationApiItem {
  return {
    notificationId: 1,
    notificationType: 'INQUIRY_ANSWERED',
    title: '문의에 답변이 등록되었습니다.',
    content: '오류 신고 · 서버 500',
    targetType: 'INQUIRY',
    targetId: 7,
    targetAvailable: true,
    targetUnavailableReason: null,
    deepLink: '/inquiries/7',
    read: false,
    readAt: null,
    createdAt: '2026-09-01T09:00:00',
    ...overrides,
  };
}

function loadedMetrics(counts: ApplicationStatusCounts): AdminDashboardMetrics {
  return {
    pendingSignups: metric<number>({ data: 8 }),
    unansweredInquiries: metric<number>({ data: 15 }),
    jobPostings: metric<number>({ data: 35 }),
    applicationStatusCounts: metric<ApplicationStatusCounts>({ data: counts }),
    notifications: metric<NotificationApiItem[]>({ data: [notificationItem()] }),
  };
}

function card(cards: KpiCardData[], id: string): KpiCardData {
  const found = cards.find((item) => item.id === id);
  if (!found) throw new Error(`카드 없음: ${id}`);
  return found;
}

const BASE = DASHBOARD_CONTENT.admin;

describe('buildAdminDashboardContent', () => {
  it('로딩 중이면 연동 카드는 loadState=loading, 표 값은 자리표시자다', () => {
    const content = buildAdminDashboardContent(BASE, {
      pendingSignups: metric<number>({ isLoading: true }),
      unansweredInquiries: metric<number>({ isLoading: true }),
      jobPostings: metric<number>({ isLoading: true }),
      applicationStatusCounts: metric<ApplicationStatusCounts>({ isLoading: true }),
      notifications: metric<NotificationApiItem[]>({ isLoading: true }),
    });

    expect(card(content.kpiCards, 'signup').loadState).toBe('loading');
    expect(card(content.kpiCards, 'applications').loadState).toBe('loading');
    expect(card(content.kpiCards, 'inquiries').loadState).toBe('loading');
    expect(card(content.kpiCards, 'jobs').loadState).toBe('loading');
    expect(content.table.rows.every((row) => row.cells[1].label === '—')).toBe(true);
    expect(content.notificationsLoadState).toBe('loading');
  });

  it('프로그램 KPI만 미지원으로 두고 공고 KPI는 실데이터로 채운다', () => {
    const content = buildAdminDashboardContent(
      BASE,
      loadedMetrics({ totalCount: 100, counts: {} }),
    );

    expect(card(content.kpiCards, 'programs').unsupported).toBe(true);
    expect(card(content.kpiCards, 'jobs').unsupported).toBeUndefined();
    expect(card(content.kpiCards, 'jobs').count).toBe('35건');
    expect(card(content.kpiCards, 'jobs').description).toBe('모집 · 마감');
    expect(card(content.kpiCards, 'inquiries').unsupported).toBeUndefined();
  });

  it('조회 성공 시 KPI · 처리 현황 표 · 알림 사이드바를 실데이터로 채운다', () => {
    const content = buildAdminDashboardContent(
      BASE,
      loadedMetrics({
        totalCount: 1248,
        counts: { SUBMITTED: 42, REVISION_REQUESTED: 14, APPROVED: 28 },
      }),
    );

    expect(card(content.kpiCards, 'signup').count).toBe('8건');
    expect(card(content.kpiCards, 'applications').count).toBe('1,248건');
    expect(card(content.kpiCards, 'inquiries').count).toBe('15건');

    // 42 / (42+14+28) = 50%, 14 → 17%, 28 → 33%
    expect(content.table.rows.map((row) => row.cells.map((cell) => cell.label))).toEqual([
      ['검토 대기', '42건', '50%', '목록 보기'],
      ['수정 요청', '14건', '17%', '목록 보기'],
      ['승인 완료', '28건', '33%', '목록 보기'],
    ]);

    expect(content.notificationsLoadState).toBeUndefined();
    expect(content.notifications).toHaveLength(1);
    expect(content.notifications[0]).toMatchObject({
      id: '1',
      tone: 'warning',
      title: '문의에 답변이 등록되었습니다.',
    });
    expect(content.notifications[0].subtitle).toContain('오류 신고 · 서버 500');
  });

  it('알림 조회가 실패하면 사이드바만 에러를 표시한다', () => {
    const onRetry = vi.fn();
    const content = buildAdminDashboardContent(BASE, {
      ...loadedMetrics({ totalCount: 10, counts: {} }),
      notifications: metric<NotificationApiItem[]>({ isError: true, onRetry }),
    });

    expect(content.notificationsLoadState).toBe('error');
    expect(content.onNotificationsRetry).toBe(onRetry);
    expect(card(content.kpiCards, 'signup').loadState).toBeUndefined();
  });

  it('상태별 건수 조회가 실패하면 전체 지원서 카드와 표에 에러를 표시한다', () => {
    const onRetry = vi.fn();
    const content = buildAdminDashboardContent(BASE, {
      pendingSignups: metric<number>({ data: 8 }),
      unansweredInquiries: metric<number>({ data: 15 }),
      jobPostings: metric<number>({ data: 35 }),
      applicationStatusCounts: metric<ApplicationStatusCounts>({ isError: true, onRetry }),
      notifications: metric<NotificationApiItem[]>({ data: [] }),
    });

    expect(card(content.kpiCards, 'applications').loadState).toBe('error');
    expect(card(content.kpiCards, 'applications').onRetry).toBe(onRetry);
    expect(content.table.hasError).toBe(true);
    expect(content.table.onRetry).toBe(onRetry);
  });

  it('공고 조회가 실패하면 해당 카드만 에러를 표시한다', () => {
    const onRetry = vi.fn();
    const content = buildAdminDashboardContent(BASE, {
      pendingSignups: metric<number>({ data: 8 }),
      unansweredInquiries: metric<number>({ data: 15 }),
      jobPostings: metric<number>({ isError: true, onRetry }),
      applicationStatusCounts: metric<ApplicationStatusCounts>({
        data: { totalCount: 10, counts: {} },
      }),
      notifications: metric<NotificationApiItem[]>({ data: [] }),
    });

    expect(card(content.kpiCards, 'jobs').loadState).toBe('error');
    expect(card(content.kpiCards, 'jobs').onRetry).toBe(onRetry);
    expect(card(content.kpiCards, 'applications').loadState).toBeUndefined();
  });

  it('합계가 0이면 비율은 0%다(0으로 나누지 않는다)', () => {
    const content = buildAdminDashboardContent(BASE, loadedMetrics({ totalCount: 0, counts: {} }));

    expect(content.table.rows.map((row) => row.cells[2].label)).toEqual(['0%', '0%', '0%']);
  });
});
