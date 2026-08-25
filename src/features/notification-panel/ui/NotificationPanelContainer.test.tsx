import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotificationPanelContainer } from './NotificationPanelContainer';

const { mockMutate, mockPush, mockReset, mockUseNotificationListQuery } = vi.hoisted(() => ({
  mockMutate: vi.fn(),
  mockPush: vi.fn(),
  mockReset: vi.fn(),
  mockUseNotificationListQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/entities/notification', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/notification')>();
  return {
    ...actual,
    useNotificationListQuery: mockUseNotificationListQuery,
    useReadNotificationMutation: () => ({
      isPending: false,
      isError: false,
      mutate: mockMutate,
      reset: mockReset,
    }),
  };
});

const BASE_API_NOTIFICATION = {
  notificationId: 1,
  notificationType: 'INQUIRY_ANSWERED' as const,
  title: '문의 답변이 등록되었습니다',
  content: '답변을 확인해주세요.',
  targetType: 'INQUIRY' as const,
  targetId: 2,
  targetAvailable: true,
  targetUnavailableReason: null,
  deepLink: '/inquiries/2',
  read: false,
  readAt: null,
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  mockMutate.mockReset();
  mockPush.mockReset();
  mockReset.mockReset();
  mockUseNotificationListQuery.mockReset();
  mockUseNotificationListQuery.mockReturnValue({
    data: { content: [BASE_API_NOTIFICATION], unreadCount: 1 },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  });
});

describe('NotificationPanelContainer', () => {
  it('읽지 않은 알림을 선택하면 개별 읽음 처리 후 서버 딥링크로 이동한다', () => {
    render(<NotificationPanelContainer isOpen />);

    fireEvent.click(screen.getByRole('button', { name: /문의 답변이 등록되었습니다/ }));

    expect(mockMutate).toHaveBeenCalledWith({ scope: 'SINGLE', notificationId: 1 });
    expect(mockPush).toHaveBeenCalledWith('/inquiries/2');
  });

  it('이동할 수 없는 알림은 읽음 처리하고 대체 안내를 표시한다', () => {
    mockUseNotificationListQuery.mockReturnValue({
      data: {
        content: [
          {
            ...BASE_API_NOTIFICATION,
            title: '삭제된 문의 알림',
            targetAvailable: false,
            targetUnavailableReason: 'DELETED',
            deepLink: null,
          },
        ],
        unreadCount: 1,
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    render(<NotificationPanelContainer isOpen />);

    fireEvent.click(screen.getByRole('button', { name: /삭제된 문의 알림/ }));

    expect(mockMutate).toHaveBeenCalledWith({ scope: 'SINGLE', notificationId: 1 });
    expect(mockPush).not.toHaveBeenCalled();
    expect(
      screen.getByRole('dialog', { name: '해당 문의를 찾을 수 없습니다.' }),
    ).toBeInTheDocument();
  });

  it('모두 읽음을 선택하면 전체 읽음 처리한다', () => {
    render(<NotificationPanelContainer isOpen />);

    fireEvent.click(screen.getByRole('button', { name: '모두 읽음' }));

    expect(mockMutate).toHaveBeenCalledWith({ scope: 'ALL' });
  });
});
