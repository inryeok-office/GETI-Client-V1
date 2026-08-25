import { api, type ApiResponse } from '@/shared/api';

import type {
  FetchNotificationListParams,
  NotificationListApiResponse,
  ReadNotificationApiResponse,
  ReadNotificationRequest,
  UnreadNotificationCountApiResponse,
} from '../model/types';

const NOTIFICATION_PATH = '/api/v1/notifications';

/** 요청한 사용자의 인앱 알림을 서버 고정 정렬인 최신순으로 조회한다. */
export async function fetchNotificationList(
  params: FetchNotificationListParams = {},
): Promise<NotificationListApiResponse> {
  const { data } = await api.get<ApiResponse<NotificationListApiResponse>>(NOTIFICATION_PATH, {
    params: { page: 0, size: 20, ...params },
  });
  return data.data;
}

/** 헤더 Badge에 표시할 읽지 않은 알림 전체 개수를 조회한다. */
export async function fetchUnreadNotificationCount(): Promise<UnreadNotificationCountApiResponse> {
  const { data } = await api.get<ApiResponse<UnreadNotificationCountApiResponse>>(
    `${NOTIFICATION_PATH}/unread-count`,
  );
  return data.data;
}

/** 알림 한 건 또는 요청자 본인의 모든 알림을 읽음 처리한다. */
export async function readNotification(
  request: ReadNotificationRequest,
): Promise<ReadNotificationApiResponse> {
  const { data } = await api.patch<ApiResponse<ReadNotificationApiResponse>>(
    `${NOTIFICATION_PATH}/read`,
    request,
  );
  return data.data;
}
