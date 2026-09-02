import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { OperationJob } from '@/entities/scheduler';

import { AdminSchedulerManagement } from './AdminSchedulerManagement';

function createTask(overrides: Partial<OperationJob> = {}): OperationJob {
  return {
    actionStatus: 'SUPPORTED',
    description: '외부 채용 공고를 수집합니다.',
    failureCount: 0,
    finishedAt: '2026-09-02T03:05:00',
    jobType: 'JOB_COLLECTION',
    lastError: null,
    lastRunAt: '2026-09-02T03:00:00',
    name: '채용 공고 수집',
    nextRunAt: '2026-09-03T03:00:00',
    operationId: 'collection-1',
    partialSuccessCount: 0,
    processedCount: 10,
    schedule: 'cron: 0 0 3 * * *',
    startedAt: '2026-09-02T03:00:00',
    status: 'SUCCESS',
    successCount: 10,
    taskId: 'JOB_COLLECTION',
    ...overrides,
  };
}

const TASKS: OperationJob[] = [
  createTask(),
  createTask({
    actionStatus: 'UNSUPPORTED',
    jobType: 'PROGRAM_CLOSE',
    lastRunAt: null,
    name: '프로그램 마감',
    nextRunAt: null,
    operationId: null,
    status: 'NO_HISTORY',
    taskId: 'PROGRAM_CLOSE',
  }),
];

describe('AdminSchedulerManagement', () => {
  it('실제 작업 목록과 실행 상태, 수동 실행 지원 여부를 표시한다', () => {
    render(<AdminSchedulerManagement listStatus="success" tasks={TASKS} onRetry={vi.fn()} />);

    const table = screen.getByRole('table');
    expect(within(table).getByText('채용 공고 수집')).toBeInTheDocument();
    expect(within(table).getByText('2026.09.02 03:00')).toBeInTheDocument();
    expect(within(table).getByText('2026.09.03 03:00')).toBeInTheDocument();
    expect(within(table).getByText('성공')).toBeInTheDocument();
    expect(within(table).getByText('이력 없음')).toBeInTheDocument();
    expect(within(table).getByText('지원됨')).toBeInTheDocument();
    expect(within(table).getByText('미지원')).toBeInTheDocument();
    expect(within(table).getAllByText('-')).toHaveLength(2);
    expect(screen.getByRole('region', { name: '정기 작업 목록' })).toHaveClass('overflow-x-auto');
  });

  it('알 수 없는 서버 상태는 원본 값을 표시한다', () => {
    render(
      <AdminSchedulerManagement
        listStatus="success"
        tasks={[createTask({ status: 'CUSTOM_STATUS' })]}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText('CUSTOM_STATUS')).toBeInTheDocument();
  });

  it('Discord 전송 상태를 한글 라벨로 표시한다', () => {
    render(
      <AdminSchedulerManagement
        listStatus="success"
        tasks={[
          createTask({ status: 'SENDING' }),
          createTask({
            jobType: 'DISCORD_DELIVERY_RETRY',
            status: 'DELIVERED',
            taskId: 'DISCORD_DELIVERY_RETRY',
          }),
        ]}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText('전송 중')).toBeInTheDocument();
    expect(screen.getByText('성공')).toHaveClass('text-status-success');
  });

  it('오류 상태에서 다시 시도를 전달한다', () => {
    const onRetry = vi.fn();
    render(<AdminSchedulerManagement listStatus="error" tasks={[]} onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('정기 작업을 불러올 수 없습니다.');
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('로딩 상태를 표시한다', () => {
    render(<AdminSchedulerManagement listStatus="loading" tasks={[]} onRetry={vi.fn()} />);

    expect(
      screen.getByRole('status', { name: '정기 작업 목록을 불러오는 중' }),
    ).toBeInTheDocument();
  });

  it('빈 상태를 표시한다', () => {
    render(<AdminSchedulerManagement listStatus="empty" tasks={[]} onRetry={vi.fn()} />);

    expect(screen.getByText('등록된 정기 작업이 없습니다.')).toBeInTheDocument();
  });
});
