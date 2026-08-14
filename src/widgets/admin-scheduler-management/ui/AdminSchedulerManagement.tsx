'use client';

import { useState } from 'react';

import type { ScheduledTask } from '@/entities/scheduler';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

export type AdminSchedulerListStatus = 'empty' | 'error' | 'loading' | 'success';

interface AdminSchedulerManagementProps {
  initialStatus: AdminSchedulerListStatus;
  tasks: ScheduledTask[];
}

const COLUMN_WIDTHS = [
  'w-[310px]',
  'w-[260px]',
  'w-[260px]',
  'w-[260px]',
  'w-[220px]',
  'w-[220px]',
];

export function AdminSchedulerManagement({ initialStatus, tasks }: AdminSchedulerManagementProps) {
  const [listStatus, setListStatus] = useState(initialStatus);
  const [items, setItems] = useState(tasks);

  const handleRetry = (taskId: string) => {
    setItems((current) =>
      current.map((task) =>
        task.taskId === taskId ? { ...task, actionStatus: 'REQUESTED' } : task,
      ),
    );
  };

  const handleReload = () => setListStatus(tasks.length > 0 ? 'success' : 'empty');

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminSchedulerHeader />
      <div className="px-4 py-8 xl:px-6 xl:py-10 2xl:px-10">
        <div className="w-full max-w-[1620px]">
          <header>
            <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
              정기 작업
            </h1>
            <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-700">
              자동으로 실행되는 시스템 작업의 상태와 최근 실행 내역을 확인합니다.
            </p>
          </header>

          <section className="mt-6" aria-labelledby="scheduler-list-heading">
            <h2
              id="scheduler-list-heading"
              className="mb-4 text-base leading-[26px] tracking-[-0.16px] text-neutral-900"
            >
              작업 목록
            </h2>

            <div
              role="region"
              aria-label="정기 작업 목록"
              tabIndex={0}
              className="overflow-x-auto rounded-xl border border-neutral-200 bg-white"
            >
              {listStatus === 'loading' ? <SchedulerTableSkeleton /> : null}
              {listStatus === 'error' ? <SchedulerError onRetry={handleReload} /> : null}
              {listStatus === 'empty' ? <SchedulerEmpty /> : null}
              {listStatus === 'success' ? (
                <SchedulerTable tasks={items} onRetry={handleRetry} />
              ) : null}
            </div>
          </section>

          <div className="bg-primary-50 text-primary-800 mt-6 rounded-lg px-4 py-3 text-xs leading-[1.5] tracking-[-0.12px]">
            실패한 작업만 재실행할 수 있습니다. 실행 결과와 관리자 작업 기록은 감사 로그에서 확인할
            수 있습니다.
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSchedulerHeader() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-4 xl:px-6 2xl:px-10">
      <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">정기 작업</p>
      <div className="flex items-center gap-3" aria-label="관리자 정보">
        <span className="bg-primary-100 size-8 rounded-full" aria-hidden="true" />
        <span className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
          개발자 · 외 1개
        </span>
        <Icon name="chevronRight" className="h-6 w-3 rotate-90 text-neutral-500" />
      </div>
    </header>
  );
}

interface SchedulerTableProps {
  onRetry: (taskId: string) => void;
  tasks: ScheduledTask[];
}

function SchedulerTable({ onRetry, tasks }: SchedulerTableProps) {
  return (
    <table className="w-full min-w-[1530px] table-fixed border-collapse text-left">
      <caption className="sr-only">정기 작업별 실행 주기와 최근 실행 상태</caption>
      <colgroup>
        {COLUMN_WIDTHS.map((width, index) => (
          <col key={`${width}-${index}`} className={width} />
        ))}
      </colgroup>
      <thead className="bg-neutral-50">
        <tr className="h-[66px]">
          {['작업', '실행 주기', '최근 실행', '다음 실행', '상태', '작업'].map((label, index) => (
            <th
              key={`${label}-${index}`}
              scope="col"
              className="px-5 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600"
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.taskId} className="h-[66px] bg-white">
            <td className="px-5">
              <p className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-800">
                {task.name}
              </p>
              <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                {task.description}
              </p>
            </td>
            <td className="px-5 text-sm tracking-[-0.14px] text-neutral-800">{task.schedule}</td>
            <td className="px-5 text-sm tracking-[-0.14px] text-neutral-800">{task.lastRunAt}</td>
            <td className="px-5 text-sm tracking-[-0.14px] text-neutral-800">{task.nextRunAt}</td>
            <td className="px-5 text-sm tracking-[-0.14px] text-neutral-800">
              {task.status === 'SUCCESS' ? '성공' : '실패'}
            </td>
            <td className="px-5">
              <SchedulerAction task={task} onRetry={onRetry} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SchedulerAction({
  task,
  onRetry,
}: {
  task: ScheduledTask;
  onRetry: (taskId: string) => void;
}) {
  if (task.actionStatus === 'REQUESTED') {
    return (
      <span className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-500">요청됨</span>
    );
  }

  if (task.actionStatus === 'AVAILABLE') {
    return (
      <button
        type="button"
        onClick={() => onRetry(task.taskId)}
        className="text-primary-700 text-sm leading-[1.4] font-medium tracking-[-0.14px]"
      >
        재실행
      </button>
    );
  }

  return <span className="text-sm tracking-[-0.14px] text-neutral-500">재실행</span>;
}

function SchedulerTableSkeleton() {
  return (
    <div
      role="status"
      aria-label="정기 작업 목록을 불러오는 중"
      className="min-w-[1530px] animate-pulse"
    >
      <div className="h-[66px] bg-neutral-50" />
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex h-[66px] items-center gap-20 px-5">
          <span className="h-4 w-48 rounded bg-neutral-200" />
          {Array.from({ length: 5 }, (__, cellIndex) => (
            <span key={cellIndex} className="h-4 w-28 rounded bg-neutral-100" />
          ))}
        </div>
      ))}
    </div>
  );
}

function SchedulerError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex min-h-[396px] flex-col items-center justify-center px-6 py-12"
    >
      <Icon name="alertCircleLarge" className="size-12 text-neutral-400" />
      <p className="mt-4 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        정기 작업을 불러올 수 없습니다.
      </p>
      <p className="mt-2 text-sm tracking-[-0.14px] text-neutral-600">
        잠시 후 다시 시도해 주세요.
      </p>
      <Button className="mt-6" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  );
}

function SchedulerEmpty() {
  return (
    <div className="flex min-h-[396px] flex-col items-center justify-center px-6 py-12 text-center">
      <Icon name="clock" className="size-[72px] text-neutral-400" />
      <p className="mt-4 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        등록된 정기 작업이 없습니다.
      </p>
      <p className="mt-2 text-sm tracking-[-0.14px] text-neutral-600">
        실행할 정기 작업이 등록되면 이곳에 표시됩니다.
      </p>
    </div>
  );
}
