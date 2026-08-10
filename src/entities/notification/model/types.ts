export type NotificationTargetStatus = 'AVAILABLE' | 'DELETED';

export interface Notification {
  content: string;
  isRead: boolean;
  notificationId: string;
  relativeTime: string;
  targetStatus: NotificationTargetStatus;
  title: string;
}
