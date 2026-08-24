import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchNotificationList,
  fetchUnreadNotificationCount,
  readNotification,
} from './notificationApi';

const { mockGet, mockPatch } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPatch: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  api: {
    get: mockGet,
    patch: mockPatch,
  },
}));

beforeEach(() => {
  mockGet.mockReset();
  mockPatch.mockReset();
});

describe('notificationApi', () => {
  it('내 알림 목록을 기본 페이지 조건과 함께 조회한다', async () => {
    const responseData = {
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      unreadCount: 0,
    };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchNotificationList()).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/notifications', {
      params: { page: 0, size: 20 },
    });
  });

  it('헤더 Badge용 미읽음 수를 조회한다', async () => {
    const responseData = { unreadCount: 4 };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchUnreadNotificationCount()).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/notifications/unread-count');
  });

  it('개별 알림 읽음 처리 Payload를 전달한다', async () => {
    const request = { scope: 'SINGLE' as const, notificationId: 12 };
    const responseData = { unreadCount: 2, updatedCount: 1, readAt: '2026-08-24T12:00:00' };
    mockPatch.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(readNotification(request)).resolves.toBe(responseData);
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/notifications/read', request);
  });
});
