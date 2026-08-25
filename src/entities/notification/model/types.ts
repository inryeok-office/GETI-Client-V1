export type NotificationType =
  | 'JOB_PUBLISHED'
  | 'JOB_UPDATED'
  | 'JOB_CLOSED'
  | 'JOB_DELETED'
  | 'JOB_APPLICATION_STATUS_CHANGED'
  | 'PROGRAM_PUBLISHED'
  | 'PROGRAM_UPDATED'
  | 'PROGRAM_CLOSED'
  | 'PROGRAM_DELETED'
  | 'PROGRAM_APPLICATION_APPLIED'
  | 'PROGRAM_APPLICATION_CANCELED'
  | 'PROGRAM_VACANCY_AVAILABLE'
  | 'INQUIRY_ANSWERED'
  | 'MEMBER_APPROVAL_RESULT'
  | 'SYSTEM';

export type NotificationTargetType =
  'JOB' | 'JOB_APPLICATION' | 'PROGRAM' | 'PORTFOLIO_REQUEST' | 'INQUIRY' | 'MEMBER_APPROVAL';

export type NotificationTargetUnavailableReason = 'DELETED' | 'NOT_VISIBLE' | 'FORBIDDEN';

export type NotificationTargetStatus =
  'AVAILABLE' | NotificationTargetUnavailableReason | 'UNSUPPORTED';

export type NotificationReadScope = 'ALL' | 'SINGLE';

export interface Notification {
  content: string;
  deepLink: string | null;
  isRead: boolean;
  notificationId: number;
  relativeTime: string;
  targetStatus: NotificationTargetStatus;
  targetType: NotificationTargetType | null;
  title: string;
}

export interface NotificationApiItem {
  notificationId: number;
  notificationType: NotificationType;
  title: string;
  content: string;
  targetType: NotificationTargetType | null;
  targetId: number | null;
  targetAvailable: boolean;
  targetUnavailableReason: NotificationTargetUnavailableReason | null;
  deepLink: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListApiResponse {
  content: NotificationApiItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  unreadCount: number;
}

export interface UnreadNotificationCountApiResponse {
  unreadCount: number;
}

export interface FetchNotificationListParams {
  unreadOnly?: boolean;
  notificationType?: NotificationType;
  page?: number;
  size?: number;
}

export type ReadNotificationRequest =
  | { scope: Extract<NotificationReadScope, 'ALL'> }
  | { scope: Extract<NotificationReadScope, 'SINGLE'>; notificationId: number };

export interface ReadNotificationApiResponse {
  unreadCount: number;
  updatedCount: number;
  readAt: string | null;
}
