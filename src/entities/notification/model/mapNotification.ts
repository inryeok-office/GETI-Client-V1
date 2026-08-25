import { formatNotificationRelativeTime } from './formatNotificationRelativeTime';
import type { Notification, NotificationApiItem, NotificationTargetStatus } from './types';

function resolveDeepLink(notification: NotificationApiItem): string | null {
  const { deepLink, targetId, targetType } = notification;
  if (targetId === null || !deepLink) return null;

  const supportedDeepLinks = {
    JOB: { serverPath: `/jobs/${targetId}`, webPath: `/jobs/${targetId}` },
    JOB_APPLICATION: {
      serverPath: `/job-applications/${targetId}`,
      webPath: `/applications/${targetId}`,
    },
    PROGRAM: { serverPath: `/programs/${targetId}`, webPath: `/programs/${targetId}` },
    PORTFOLIO_REQUEST: {
      serverPath: `/portfolios/${targetId}`,
      webPath: `/portfolios/${targetId}`,
    },
    INQUIRY: { serverPath: `/inquiries/${targetId}`, webPath: `/inquiries/${targetId}` },
  } as const;

  if (!targetType || targetType === 'MEMBER_APPROVAL') return null;

  const supportedDeepLink = supportedDeepLinks[targetType];
  return deepLink === supportedDeepLink.serverPath ? supportedDeepLink.webPath : null;
}

function resolveTargetStatus(
  notification: NotificationApiItem,
  deepLink: string | null,
): NotificationTargetStatus {
  if (notification.targetAvailable && deepLink) return 'AVAILABLE';
  return notification.targetUnavailableReason ?? 'UNSUPPORTED';
}

export function mapNotification(notification: NotificationApiItem): Notification {
  const deepLink = resolveDeepLink(notification);
  return {
    notificationId: notification.notificationId,
    title: notification.title,
    content: notification.content,
    relativeTime: formatNotificationRelativeTime(notification.createdAt),
    isRead: notification.read,
    targetStatus: resolveTargetStatus(notification, deepLink),
    targetType: notification.targetType,
    deepLink,
  };
}
