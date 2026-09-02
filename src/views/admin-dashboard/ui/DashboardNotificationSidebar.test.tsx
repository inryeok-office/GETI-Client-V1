import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { DashboardNotification } from '../model/types';

import { DashboardNotificationSidebar } from './DashboardNotificationSidebar';

const BASE_PROPS = {
  title: '알림',
  titleColor: '#111111',
} as const;

const NOTIFICATIONS: DashboardNotification[] = [
  { id: '1', tone: 'brand', title: '지원서가 재제출되었습니다.', subtitle: '김민재 지원자 · 방금' },
  { id: '2', tone: 'warning', title: '문의가 접수되었습니다.', subtitle: '박서준 · 1시간 전' },
];

describe('DashboardNotificationSidebar', () => {
  it('로딩 상태면 안내 문구를 aria-busy와 함께 보여준다', () => {
    render(<DashboardNotificationSidebar {...BASE_PROPS} notifications={[]} loadState="loading" />);

    const message = screen.getByText('불러오는 중...');
    expect(message).toBeInTheDocument();
    expect(message).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument();
  });

  it('에러 상태면 안내 문구와 "다시 시도" 버튼을 보여주고, 클릭하면 onRetry를 호출한다', () => {
    const onRetry = vi.fn();
    render(
      <DashboardNotificationSidebar
        {...BASE_PROPS}
        notifications={[]}
        loadState="error"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText('알림을 불러오지 못했습니다.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('조회 상태가 아니고 목록이 비었으면 emptyLabel을 보여준다', () => {
    render(
      <DashboardNotificationSidebar
        {...BASE_PROPS}
        notifications={[]}
        emptyLabel="새 알림이 없습니다."
      />,
    );

    expect(screen.getByText('새 알림이 없습니다.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument();
  });

  it('알림이 있으면 각 항목의 제목과 부제를 렌더한다', () => {
    render(
      <DashboardNotificationSidebar
        {...BASE_PROPS}
        notifications={NOTIFICATIONS}
        emptyLabel="새 알림이 없습니다."
      />,
    );

    expect(screen.getByText('지원서가 재제출되었습니다.')).toBeInTheDocument();
    expect(screen.getByText('김민재 지원자 · 방금')).toBeInTheDocument();
    expect(screen.getByText('문의가 접수되었습니다.')).toBeInTheDocument();
    expect(screen.queryByText('새 알림이 없습니다.')).not.toBeInTheDocument();
  });
});
