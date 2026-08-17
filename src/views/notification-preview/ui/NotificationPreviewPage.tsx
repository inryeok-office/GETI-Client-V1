import {
  MOCK_NOTIFICATIONS,
  MOCK_NOTIFICATIONS_WITH_DELETED_TARGET,
} from '@/entities/notification';
import { NotificationPanel, type NotificationPanelStatus } from '@/features/notification-panel';

interface NotificationPreviewPageProps {
  searchParams: Promise<{ variant?: string }>;
}

const STATUS_BY_VARIANT: Record<string, NotificationPanelStatus> = {
  empty: 'empty',
  error: 'error',
  loading: 'loading',
};

/** 헤더 연결 전 알림 패널의 디자인과 상태를 검토하는 정적 화면. */
export async function NotificationPreviewPage({ searchParams }: NotificationPreviewPageProps) {
  const { variant } = await searchParams;
  const status = STATUS_BY_VARIANT[variant ?? 'success'] ?? 'success';
  const isAllRead = variant === 'all-read';
  const isDeletedTarget = variant === 'deleted-target';
  const initialMarkAllReadState =
    variant === 'mark-all-loading' ? 'loading' : variant === 'mark-all-error' ? 'error' : 'idle';
  const notifications = isDeletedTarget
    ? MOCK_NOTIFICATIONS_WITH_DELETED_TARGET
    : MOCK_NOTIFICATIONS.map((notification) =>
        isAllRead ? { ...notification, isRead: true } : notification,
      );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] p-[40px]">
      <NotificationPanel
        initialDeletedTargetOpen={isDeletedTarget}
        initialMarkAllReadState={initialMarkAllReadState}
        mockMarkAllReadResult={variant === 'mark-all-error' ? 'error' : 'success'}
        notifications={notifications}
        status={status}
      />
    </main>
  );
}
