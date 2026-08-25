'use client';

import { useState } from 'react';

import { NotificationItem, type Notification } from '@/entities/notification';

import { MarkAllReadStatus, type MarkAllReadState } from './MarkAllReadStatus';
import { NotificationPanelState } from './NotificationPanelState';
import { UnavailableNotificationTargetDialog } from './UnavailableNotificationTargetDialog';

export type NotificationPanelStatus = 'loading' | 'error' | 'empty' | 'success';

interface NotificationPanelViewProps {
  hasUnreadNotification?: boolean;
  initialUnavailableTarget?: Notification;
  markAllReadState?: MarkAllReadState;
  notifications: Notification[];
  onCloseMarkAllReadError?: () => void;
  onMarkAllRead?: () => void;
  onRetry?: () => void;
  onSelect?: (notification: Notification) => void;
  status?: NotificationPanelStatus;
}

export function NotificationPanelView({
  hasUnreadNotification: hasUnreadNotificationProp,
  initialUnavailableTarget,
  markAllReadState = 'idle',
  notifications,
  onCloseMarkAllReadError,
  onMarkAllRead,
  onRetry,
  onSelect,
  status = 'success',
}: NotificationPanelViewProps) {
  const [unavailableTarget, setUnavailableTarget] = useState<Notification | null>(
    initialUnavailableTarget ?? null,
  );
  const hasUnreadNotification =
    hasUnreadNotificationProp ?? notifications.some((notification) => !notification.isRead);
  const isEmpty = status === 'empty';

  function handleSelect(notification: Notification) {
    onSelect?.(notification);
    if (notification.targetStatus !== 'AVAILABLE') setUnavailableTarget(notification);
  }

  function handleMarkAllRead() {
    if (!hasUnreadNotification || status !== 'success' || markAllReadState === 'loading') return;
    onMarkAllRead?.();
  }

  return (
    <>
      <section
        aria-label="알림"
        className={`flex w-[420px] max-w-full flex-col gap-[16px] overflow-hidden rounded-[16px] bg-white p-[24px] shadow-[0px_16px_40px_-8px_rgba(23,37,45,0.16)] ${isEmpty ? 'h-[375px]' : 'max-h-[calc(100vh-88px)] min-h-[511px]'}`}
      >
        <div className="flex h-[28px] shrink-0 items-center justify-between">
          <h1 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
            알림
          </h1>
          <button
            type="button"
            onClick={handleMarkAllRead}
            aria-disabled={
              !hasUnreadNotification || status !== 'success' || markAllReadState === 'loading'
            }
            disabled={
              !hasUnreadNotification || status !== 'success' || markAllReadState === 'loading'
            }
            className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#17627a] disabled:cursor-default"
          >
            모두 읽음
          </button>
        </div>

        {status === 'success' ? (
          <div className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto">
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
            onCloseError={() => onCloseMarkAllReadError?.()}
          />
        ) : null}
      </section>

      <UnavailableNotificationTargetDialog
        notification={unavailableTarget}
        onClose={() => setUnavailableTarget(null)}
      />
    </>
  );
}
