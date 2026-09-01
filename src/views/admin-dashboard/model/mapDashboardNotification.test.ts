import { describe, expect, it, vi } from 'vitest';

import type { NotificationApiItem } from '@/entities/notification';

import type { DashboardMetric } from './dashboardMetric';
import { mapDashboardNotification, resolveNotificationFeed } from './mapDashboardNotification';

const NOW = new Date('2026-09-01T12:00:00');

function item(overrides: Partial<NotificationApiItem> = {}): NotificationApiItem {
  return {
    notificationId: 1,
    notificationType: 'JOB_PUBLISHED',
    title: '새 공고가 등록되었습니다.',
    content: '프론트엔드 인턴',
    targetType: 'JOB',
    targetId: 5,
    targetAvailable: true,
    targetUnavailableReason: null,
    deepLink: '/jobs/5',
    read: false,
    readAt: null,
    createdAt: '2026-09-01T09:00:00',
    ...overrides,
  };
}

function metric(
  overrides: Partial<DashboardMetric<NotificationApiItem[]>> = {},
): DashboardMetric<NotificationApiItem[]> {
  return { data: undefined, isLoading: false, isError: false, onRetry: vi.fn(), ...overrides };
}

describe('mapDashboardNotification', () => {
  it('title·상대시각 subtitle·id를 채운다', () => {
    const result = mapDashboardNotification(item(), NOW);

    expect(result).toEqual({
      id: '1',
      tone: 'brand',
      title: '새 공고가 등록되었습니다.',
      subtitle: '프론트엔드 인턴 · 3시간 전',
    });
  });

  it('content가 비면 상대 시각만 subtitle로 쓴다', () => {
    const result = mapDashboardNotification(item({ content: '' }), NOW);

    expect(result.subtitle).toBe('3시간 전');
  });

  it('알림 유형 계열로 tone을 나눈다', () => {
    expect(mapDashboardNotification(item({ notificationType: 'INQUIRY_ANSWERED' }), NOW).tone).toBe(
      'warning',
    );
    expect(
      mapDashboardNotification(item({ notificationType: 'MEMBER_APPROVAL_RESULT' }), NOW).tone,
    ).toBe('success');
    expect(mapDashboardNotification(item({ notificationType: 'SYSTEM' }), NOW).tone).toBe(
      'neutral',
    );
    expect(mapDashboardNotification(item({ notificationType: 'PROGRAM_CLOSED' }), NOW).tone).toBe(
      'brand',
    );
  });
});

describe('resolveNotificationFeed', () => {
  it('로딩 중이면 빈 목록 + loading', () => {
    expect(resolveNotificationFeed(metric({ isLoading: true }))).toEqual({
      notifications: [],
      notificationsLoadState: 'loading',
    });
  });

  it('에러면 빈 목록 + error + 재시도 콜백', () => {
    const onRetry = vi.fn();
    const result = resolveNotificationFeed(metric({ isError: true, onRetry }));

    expect(result.notifications).toEqual([]);
    expect(result.notificationsLoadState).toBe('error');
    expect(result.onNotificationsRetry).toBe(onRetry);
  });

  it('성공이면 매핑한 목록 + emptyLabel', () => {
    const result = resolveNotificationFeed(metric({ data: [item()] }));

    expect(result.notifications).toHaveLength(1);
    expect(result.notificationsLoadState).toBeUndefined();
    expect(result.notificationsEmptyLabel).toBe('새 알림이 없습니다.');
  });
});
