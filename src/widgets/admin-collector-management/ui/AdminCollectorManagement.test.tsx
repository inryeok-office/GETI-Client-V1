import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { CollectorRun } from '@/entities/collector';

import { AdminCollectorManagement } from './AdminCollectorManagement';

const RUNS: CollectorRun[] = [
  {
    runId: 'run-1',
    sourceName: '잡코리아',
    executedAt: '2026.08.01 09:00:12',
    status: 'PARTIAL_SUCCESS',
    createdCount: 24,
    updatedCount: 18,
    failedCount: 3,
    errorSummary: [
      {
        title: '공고 상세 페이지 접근 실패',
        description: '3개 공고에서 403 응답이 발생했습니다.',
      },
    ],
  },
  {
    runId: 'run-2',
    sourceName: '사람인',
    executedAt: '2026.08.01 08:30:05',
    status: 'SUCCESS',
    createdCount: 31,
    updatedCount: 12,
    failedCount: 0,
    errorSummary: [],
  },
];

describe('AdminCollectorManagement', () => {
  it('수집 실행 이력과 오류 여부를 표시한다', () => {
    render(<AdminCollectorManagement initialStatus="success" runs={RUNS} />);

    expect(screen.getByRole('heading', { name: '외부 수집 관리' })).toBeInTheDocument();
    expect(screen.getByText('일부 실패')).toBeInTheDocument();
    expect(screen.getByText('오류 없음')).toBeInTheDocument();
  });

  it('상세 보기를 누르면 실행 상세 패널을 표시하고 닫을 수 있다', () => {
    render(<AdminCollectorManagement initialStatus="success" runs={RUNS} />);

    fireEvent.click(screen.getByRole('button', { name: '상세 보기' }));
    expect(screen.getByRole('dialog', { name: '작업 실행 상세' })).toBeInTheDocument();
    expect(screen.getByText('공고 상세 페이지 접근 실패')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '상세 패널 닫기' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('초기 선택 실행의 상세 패널을 표시한다', () => {
    render(
      <AdminCollectorManagement initialSelectedRunId="run-1" initialStatus="success" runs={RUNS} />,
    );

    expect(screen.getByRole('dialog', { name: '작업 실행 상세' })).toBeInTheDocument();
  });

  it.each([
    ['loading', '수집 실행 이력을 불러오는 중'],
    ['error', '수집 이력을 불러올 수 없습니다.'],
    ['empty', '수집 실행 이력이 없습니다.'],
  ] as const)('%s 상태를 표시한다', (initialStatus, accessibleName) => {
    render(<AdminCollectorManagement initialStatus={initialStatus} runs={[]} />);

    if (initialStatus === 'loading') {
      expect(screen.getByRole('status', { name: accessibleName })).toBeInTheDocument();
      return;
    }

    expect(screen.getByText(accessibleName)).toBeInTheDocument();
  });

  it('오류 상태에서 다시 시도하면 실행 이력을 표시한다', () => {
    render(<AdminCollectorManagement initialStatus="error" runs={RUNS} />);

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(screen.getByRole('region', { name: '수집 실행 이력' })).toBeInTheDocument();
  });
});
