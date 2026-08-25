'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  FetchNotificationListParams,
  NotificationListApiResponse,
  ReadNotificationApiResponse,
  ReadNotificationRequest,
  UnreadNotificationCountApiResponse,
} from '../model/types';
import {
  fetchNotificationList,
  fetchUnreadNotificationCount,
  readNotification,
} from './notificationApi';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: FetchNotificationListParams) => [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export function useNotificationListQuery(
  params: FetchNotificationListParams = {},
  isEnabled = true,
) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => fetchNotificationList(params),
    enabled: isEnabled,
  });
}

export function useUnreadNotificationCountQuery() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: fetchUnreadNotificationCount,
  });
}

function markCachedNotificationsAsRead(
  current: NotificationListApiResponse | undefined,
  request: ReadNotificationRequest,
  response: ReadNotificationApiResponse,
): NotificationListApiResponse | undefined {
  if (!current) return current;

  return {
    ...current,
    unreadCount: response.unreadCount,
    content: current.content.map((notification) => {
      const isTarget =
        request.scope === 'ALL' || notification.notificationId === request.notificationId;
      if (!isTarget) return notification;
      return { ...notification, read: true, readAt: notification.readAt ?? response.readAt };
    }),
  };
}

export function useReadNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ReadNotificationRequest) => readNotification(request),
    onSuccess: async (response, request) => {
      queryClient.setQueriesData<NotificationListApiResponse>(
        { queryKey: notificationKeys.lists() },
        (current) => markCachedNotificationsAsRead(current, request, response),
      );
      queryClient.setQueryData<UnreadNotificationCountApiResponse>(notificationKeys.unreadCount(), {
        unreadCount: response.unreadCount,
      });
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
