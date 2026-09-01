import {
  formatNotificationRelativeTime,
  type NotificationApiItem,
  type NotificationType,
} from '@/entities/notification';

import type { DashboardMetric } from './dashboardMetric';
import type { DashboardContent, DashboardNotification, DashboardTone } from './types';

/** 알림 사이드바에 표시할 최근 알림 개수. */
export const NOTIFICATION_FEED_SIZE = 4;

/** 알림 유형 계열 → 사이드바 점 색. Figma가 유형별로 색을 구분해서 대략의 계열만 맞춘다. */
function toneOf(type: NotificationType): DashboardTone {
  if (type.startsWith('INQUIRY')) return 'warning';
  if (type === 'MEMBER_APPROVAL_RESULT') return 'success';
  if (type === 'SYSTEM') return 'neutral';
  return 'brand';
}

export function mapDashboardNotification(
  item: NotificationApiItem,
  now = new Date(),
): DashboardNotification {
  const relativeTime = formatNotificationRelativeTime(item.createdAt, now);
  return {
    id: String(item.notificationId),
    tone: toneOf(item.notificationType),
    title: item.title,
    subtitle: item.content ? `${item.content} · ${relativeTime}` : relativeTime,
  };
}

type NotificationFeed = Pick<
  DashboardContent,
  'notifications' | 'notificationsLoadState' | 'onNotificationsRetry' | 'notificationsEmptyLabel'
>;

/**
 * `GET /api/v1/notifications` 지표를 대시보드 알림 사이드바 필드로 변환한다. 세 variant 빌더가
 * 공유한다. 알림 피드는 로그인한 사용자 개인 알림이라(운영 집계 아님) 별도 activity-feed API가
 * 생기기 전까지 이 값을 그대로 쓴다.
 */
export function resolveNotificationFeed(
  metric: DashboardMetric<NotificationApiItem[]>,
): NotificationFeed {
  if (metric.isError) {
    return {
      notifications: [],
      notificationsLoadState: 'error',
      onNotificationsRetry: metric.onRetry,
    };
  }
  if (metric.isLoading || metric.data === undefined) {
    return { notifications: [], notificationsLoadState: 'loading' };
  }
  return {
    notifications: metric.data.map((item) => mapDashboardNotification(item)),
    notificationsEmptyLabel: '새 알림이 없습니다.',
  };
}
