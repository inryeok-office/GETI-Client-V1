import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Notification } from '@/entities/notification';

import { NotificationPanel } from './NotificationPanel';

const NOTIFICATIONS: Notification[] = [
  {
    notificationId: 1,
    title: '지원서 수정 요청이 도착했습니다.',
    content: '제출한 지원서를 확인해 주세요.',
    relativeTime: '10분 전',
    isRead: false,
    targetStatus: 'AVAILABLE',
    targetType: 'JOB_APPLICATION',
    deepLink: '/applications/1',
  },
  {
    notificationId: 2,
    title: '삭제된 공고 알림입니다.',
    content: '공고를 확인해 주세요.',
    relativeTime: '어제',
    isRead: true,
    targetStatus: 'DELETED',
    targetType: 'JOB',
    deepLink: null,
  },
];

describe('NotificationPanel', () => {
  it('알림을 선택하면 읽음으로 변경하고 선택 콜백을 호출한다', () => {
    const handleSelect = vi.fn();
    render(<NotificationPanel notifications={NOTIFICATIONS} onSelect={handleSelect} />);

    const notification = screen.getByRole('button', {
      name: /지원서 수정 요청이 도착했습니다/,
    });
    expect(notification).toHaveTextContent('읽지 않음');

    fireEvent.click(notification);

    expect(notification).toHaveTextContent('읽음');
    expect(handleSelect).toHaveBeenCalledWith(NOTIFICATIONS[0]);
  });

  it('모두 읽음을 선택하면 처리 상태를 거쳐 모든 알림을 읽음으로 변경한다', async () => {
    render(<NotificationPanel notifications={NOTIFICATIONS} />);

    fireEvent.click(screen.getByRole('button', { name: '모두 읽음' }));

    expect(screen.getByText('알림을 모두 읽고 있습니다...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('읽지 않음')).not.toBeInTheDocument();
    });
    expect(screen.getAllByText('읽음')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '모두 읽음' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('삭제된 대상을 선택하면 이동할 수 없음 안내를 표시한다', () => {
    render(<NotificationPanel notifications={NOTIFICATIONS} />);

    fireEvent.click(screen.getByRole('button', { name: /삭제된 공고 알림입니다/ }));

    expect(
      screen.getByRole('dialog', { name: '해당 공고를 찾을 수 없습니다.' }),
    ).toBeInTheDocument();
  });

  it('오류 상태에서 재시도 동작을 제공한다', () => {
    const handleRetry = vi.fn();
    render(<NotificationPanel notifications={[]} status="error" onRetry={handleRetry} />);

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it('빈 상태를 안내한다', () => {
    render(<NotificationPanel notifications={[]} status="empty" />);

    expect(screen.getByText('새로운 알림이 없습니다.')).toBeInTheDocument();
  });

  it('모두 읽음 처리에 실패하면 오류 안내를 표시하고 닫을 수 있다', async () => {
    render(<NotificationPanel notifications={NOTIFICATIONS} mockMarkAllReadResult="error" />);

    fireEvent.click(screen.getByRole('button', { name: '모두 읽음' }));

    await waitFor(() => {
      expect(screen.getByText('알림을 모두 읽을 수 없습니다.')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: '모두 읽음 오류 닫기' }));
    expect(screen.queryByText('알림을 모두 읽을 수 없습니다.')).not.toBeInTheDocument();
  });
});
