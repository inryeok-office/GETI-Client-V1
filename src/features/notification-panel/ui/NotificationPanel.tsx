'use client';

import { useCallback, useState } from 'react';

import { NotificationItem, type Notification } from '@/entities/notification';

import { DeletedNotificationTargetDialog } from './DeletedNotificationTargetDialog';
import { MarkAllReadStatus, type MarkAllReadState } from './MarkAllReadStatus';
import { NotificationPanelState } from './NotificationPanelState';

export type NotificationPanelStatus = 'loading' | 'error' | 'empty' | 'success';

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
  const [isDeletedTargetOpen, setIsDeletedTargetOpen] = useState(initialDeletedTargetOpen);
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

    if (selectedNotification.targetStatus === 'DELETED') setIsDeletedTargetOpen(true);
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

  const closeDeletedTargetDialog = useCallback(() => setIsDeletedTargetOpen(false), []);
  const hasUnreadNotification = notifications.some((notification) => !notification.isRead);
  const isEmpty = status === 'empty';

  return (
    <>
      <section
        aria-label="알림"
        className={`flex w-[420px] max-w-full flex-col gap-[16px] overflow-hidden rounded-[16px] bg-white p-[24px] shadow-[0px_16px_40px_-8px_rgba(23,37,45,0.16)] ${isEmpty ? 'h-[375px]' : 'min-h-[511px]'}`}
      >
        <div className="flex h-[28px] shrink-0 items-center justify-between">
          <h1 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
            알림
          </h1>
          <button
            type="button"
            onClick={handleReadAll}
            aria-disabled={
              !hasUnreadNotification || status !== 'success' || markAllReadState === 'loading'
            }
            className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#17627a]"
          >
            모두 읽음
          </button>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col gap-[16px]">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.notificationId}
                notification={notification}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ) : (
          <NotificationPanelState status={status} onRetry={onRetry} />
        )}

        {status === 'success' && markAllReadState !== 'idle' ? (
          <MarkAllReadStatus
            state={markAllReadState}
            onCloseError={() => setMarkAllReadState('idle')}
          />
        ) : null}
      </section>

      <DeletedNotificationTargetDialog
        isOpen={isDeletedTargetOpen}
        onClose={closeDeletedTargetDialog}
      />
    </>
  );
}
