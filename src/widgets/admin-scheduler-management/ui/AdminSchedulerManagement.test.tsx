import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ScheduledTask } from '@/entities/scheduler';

import { AdminSchedulerManagement } from './AdminSchedulerManagement';

const TASKS: ScheduledTask[] = [
  {
    actionStatus: 'AVAILABLE',
    description: '예약된 알림을 발송',
    lastRunAt: '2026.08.13 09:00',
    name: '알림 발송',
    nextRunAt: '2026.08.14 09:00',
    schedule: '매일 09:00',
    status: 'FAILED',
    taskId: 'notification',
  },
  {
    actionStatus: 'UNAVAILABLE',
    description: '외부 채용 공고를 수집',
    lastRunAt: '2026.08.13 06:00',
    name: '외부 공고 수집',
    nextRunAt: '2026.08.14 06:00',
    schedule: '매일 06:00',
    status: 'SUCCESS',
    taskId: 'collector',
  },
];

describe('AdminSchedulerManagement', () => {
  it('작업 목록을 표시하고 실패 작업의 재실행을 요청한다', () => {
    render(<AdminSchedulerManagement initialStatus="success" tasks={TASKS} />);

    const table = screen.getByRole('table');
    expect(within(table).getByText('알림 발송')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '정기 작업 목록' })).toHaveClass('overflow-x-auto');

    fireEvent.click(within(table).getByRole('button', { name: '재실행' }));

    expect(within(table).getByText('요청됨')).toBeInTheDocument();
    expect(within(table).queryByRole('button', { name: '재실행' })).not.toBeInTheDocument();
  });

  it('오류 상태에서 다시 시도하면 목록을 표시한다', () => {
    render(<AdminSchedulerManagement initialStatus="error" tasks={TASKS} />);

    expect(screen.getByRole('alert')).toHaveTextContent('정기 작업을 불러올 수 없습니다.');
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('로딩 상태를 표시한다', () => {
    render(<AdminSchedulerManagement initialStatus="loading" tasks={TASKS} />);

    expect(
      screen.getByRole('status', { name: '정기 작업 목록을 불러오는 중' }),
    ).toBeInTheDocument();
  });

  it('빈 상태를 표시한다', () => {
    render(<AdminSchedulerManagement initialStatus="empty" tasks={[]} />);

    expect(screen.getByText('등록된 정기 작업이 없습니다.')).toBeInTheDocument();
  });
});
