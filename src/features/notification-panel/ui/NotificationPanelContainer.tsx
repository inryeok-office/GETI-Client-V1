'use client';

import { useRouter } from 'next/navigation';

import {
  mapNotification,
  useNotificationListQuery,
  useReadNotificationMutation,
} from '@/entities/notification';

import { NotificationPanelView, type NotificationPanelStatus } from './NotificationPanelView';

interface NotificationPanelContainerProps {
  isOpen: boolean;
}

const NOTIFICATION_LIST_PARAMS = { page: 0, size: 20 } as const;

export function NotificationPanelContainer({ isOpen }: NotificationPanelContainerProps) {
  const router = useRouter();
  const notificationListQuery = useNotificationListQuery(NOTIFICATION_LIST_PARAMS, isOpen);
  const readNotificationMutation = useReadNotificationMutation();
  const readAllNotificationsMutation = useReadNotificationMutation();
  const notifications = notificationListQuery.data?.content.map(mapNotification) ?? [];

  let status: NotificationPanelStatus = 'success';
  if (notificationListQuery.isPending) status = 'loading';
  else if (notificationListQuery.isError) status = 'error';
  else if (notifications.length === 0) status = 'empty';

  function handleSelect(notification: (typeof notifications)[number]) {
    if (!notification.isRead) {
      readNotificationMutation.mutate({
        scope: 'SINGLE',
        notificationId: notification.notificationId,
      });
    }
    if (notification.targetStatus === 'AVAILABLE' && notification.deepLink) {
      router.push(notification.deepLink);
    }
  }

  function handleMarkAllRead() {
    readAllNotificationsMutation.mutate({ scope: 'ALL' });
  }

  return (
    <NotificationPanelView
      notifications={notifications}
      status={status}
      hasUnreadNotification={(notificationListQuery.data?.unreadCount ?? 0) > 0}
      markAllReadState={
        readAllNotificationsMutation.isPending
          ? 'loading'
          : readAllNotificationsMutation.isError
            ? 'error'
            : 'idle'
      }
      onRetry={() => void notificationListQuery.refetch()}
      onSelect={handleSelect}
      onMarkAllRead={handleMarkAllRead}
      onCloseMarkAllReadError={readAllNotificationsMutation.reset}
    />
  );
}
