'use client';

import { useCallback, useState } from 'react';

import type { Notification } from '@/entities/notification';

import type { MarkAllReadState } from './MarkAllReadStatus';
import { NotificationPanelView, type NotificationPanelStatus } from './NotificationPanelView';

export type { NotificationPanelStatus } from './NotificationPanelView';

interface NotificationPanelProps {
  initialDeletedTargetOpen?: boolean;
  initialMarkAllReadState?: MarkAllReadState;
  mockMarkAllReadResult?: 'error' | 'success';
  notifications: Notification[];
  onRetry?: () => void;
  onSelect?: (notification: Notification) => void;
  status?: NotificationPanelStatus;
}

export function NotificationPanel({
  initialDeletedTargetOpen = false,
  initialMarkAllReadState = 'idle',
  mockMarkAllReadResult = 'success',
  notifications: initialNotifications,
  onRetry,
  onSelect,
  status = 'success',
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [markAllReadState, setMarkAllReadState] =
    useState<MarkAllReadState>(initialMarkAllReadState);

  const handleSelect = (selectedNotification: Notification) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.notificationId === selectedNotification.notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
    onSelect?.(selectedNotification);
  };

  const handleReadAll = async () => {
    if (!hasUnreadNotification || status !== 'success' || markAllReadState === 'loading') return;

    setMarkAllReadState('loading');
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (mockMarkAllReadResult === 'error') {
      setMarkAllReadState('error');
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({ ...notification, isRead: true })),
    );
    setMarkAllReadState('idle');
  };

  const hasUnreadNotification = notifications.some((notification) => !notification.isRead);
  const initialUnavailableTarget = initialDeletedTargetOpen
    ? notifications.find((notification) => notification.targetStatus !== 'AVAILABLE')
    : undefined;
  const closeMarkAllReadError = useCallback(() => setMarkAllReadState('idle'), []);

  return (
    <NotificationPanelView
      notifications={notifications}
      status={status}
      hasUnreadNotification={hasUnreadNotification}
      markAllReadState={markAllReadState}
      initialUnavailableTarget={initialUnavailableTarget}
      onRetry={onRetry}
      onSelect={handleSelect}
      onMarkAllRead={handleReadAll}
      onCloseMarkAllReadError={closeMarkAllReadError}
    />
  );
}
