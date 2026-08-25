import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NotificationListApiResponse } from '../model/types';
import {
  notificationKeys,
  useReadNotificationMutation,
  useNotificationListQuery,
} from './useNotificationQueries';

const { mockFetchNotificationList, mockReadNotification } = vi.hoisted(() => ({
  mockFetchNotificationList: vi.fn(),
  mockReadNotification: vi.fn(),
}));

vi.mock('./notificationApi', () => ({
  fetchNotificationList: mockFetchNotificationList,
  fetchUnreadNotificationCount: vi.fn(),
  readNotification: mockReadNotification,
}));

const LIST_RESPONSE: NotificationListApiResponse = {
  content: [
    {
      notificationId: 1,
      notificationType: 'INQUIRY_ANSWERED',
      title: '문의 답변이 등록되었습니다',
      content: '답변을 확인해주세요.',
      targetType: 'INQUIRY',
      targetId: 2,
      targetAvailable: true,
      targetUnavailableReason: null,
      deepLink: '/inquiries/2',
      read: false,
      readAt: null,
      createdAt: '2026-08-24T12:00:00',
    },
  ],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  unreadCount: 1,
};

function setupQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  mockFetchNotificationList.mockReset();
  mockReadNotification.mockReset();
});

describe('notification queries', () => {
  it('패널이 닫혀 있으면 알림 목록을 조회하지 않는다', () => {
    const { queryClient, wrapper } = setupQueryClient();

    const { result } = renderHook(() => useNotificationListQuery({}, false), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetchNotificationList).not.toHaveBeenCalled();
    queryClient.clear();
  });

  it('읽음 처리 성공 후 목록과 미읽음 수 캐시를 갱신한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    const listKey = notificationKeys.list({ page: 0, size: 20 });
    queryClient.setQueryData(listKey, LIST_RESPONSE);
    queryClient.setQueryData(notificationKeys.unreadCount(), { unreadCount: 1 });
    mockReadNotification.mockResolvedValue({
      unreadCount: 0,
      updatedCount: 1,
      readAt: '2026-08-24T12:01:00',
    });
    const { result } = renderHook(() => useReadNotificationMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ scope: 'SINGLE', notificationId: 1 });
    });

    const list = queryClient.getQueryData<NotificationListApiResponse>(listKey);
    expect(list?.content[0]).toMatchObject({ read: true, readAt: '2026-08-24T12:01:00' });
    expect(list?.unreadCount).toBe(0);
    expect(queryClient.getQueryData(notificationKeys.unreadCount())).toEqual({ unreadCount: 0 });
    queryClient.clear();
  });
});
