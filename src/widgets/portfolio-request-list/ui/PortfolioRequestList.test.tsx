import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { PortfolioRequestListItem } from '@/entities/portfolio-request';

import {
  PortfolioRequestList,
  type PortfolioRequestListFilter,
  type PortfolioRequestListStatus,
} from './PortfolioRequestList';

const REQUESTS: PortfolioRequestListItem[] = [
  {
    dDay: 4,
    description: '프로젝트 결과물을 제출해 주세요.',
    duePeriod: '2026.08.17 23:59',
    registeredAt: '2026.07.30',
    requestId: '1',
    status: 'REQUIRED',
    submittedCount: 0,
    targetCount: 1,
    title: '제출이 필요한 포트폴리오',
  },
  {
    dDay: null,
    description: '프로젝트 결과물을 제출해 주세요.',
    duePeriod: '2026.08.17 23:59',
    registeredAt: '2026.07.30',
    requestId: '2',
    status: 'SUBMITTED',
    submittedCount: 1,
    targetCount: 1,
    title: '제출한 포트폴리오',
  },
  {
    dDay: null,
    description: '프로젝트 결과물을 제출해 주세요.',
    duePeriod: '2026.08.17 23:59',
    registeredAt: '2026.07.30',
    requestId: '3',
    status: 'CLOSED',
    submittedCount: 0,
    targetCount: 1,
    title: '마감된 포트폴리오',
  },
];

function renderList({
  currentFilter = 'ALL',
  onFilterChange = vi.fn(),
  onPageChange = vi.fn(),
  onRetry = vi.fn(),
  requests = REQUESTS,
  status = 'success',
  totalCount = requests.length,
  totalPages = 1,
}: {
  currentFilter?: PortfolioRequestListFilter;
  onFilterChange?: (filter: PortfolioRequestListFilter) => void;
  onPageChange?: (page: number) => void;
  onRetry?: () => void;
  requests?: PortfolioRequestListItem[];
  status?: PortfolioRequestListStatus;
  totalCount?: number;
  totalPages?: number;
} = {}) {
  render(
    <PortfolioRequestList
      currentFilter={currentFilter}
      currentPage={1}
      requests={requests}
      status={status}
      totalCount={totalCount}
      totalPages={totalPages}
      onFilterChange={onFilterChange}
      onPageChange={onPageChange}
      onRetry={onRetry}
    />,
  );
}

describe('PortfolioRequestList', () => {
  it('요청 개수와 상태별 카드를 표시한다', () => {
    renderList();

    expect(screen.getByText('1', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getByRole('link', { name: '제출하기' })).toHaveAttribute('href', '/portfolios/1');
  });

  it('필터 버튼을 누르면 onFilterChange를 호출한다', async () => {
    const user = userEvent.setup();
    const handleFilterChange = vi.fn();
    renderList({ onFilterChange: handleFilterChange });

    await user.click(screen.getByRole('button', { name: '제출 마감 1' }));

    expect(handleFilterChange).toHaveBeenCalledWith('CLOSED');
  });

  it('선택된 제출 상태로 목록을 필터링한다', () => {
    renderList({ currentFilter: 'CLOSED' });

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(1);
    expect(within(articles[0]).getByText('마감된 포트폴리오')).toBeInTheDocument();
  });

  it('빈 목록 상태를 표시한다', () => {
    renderList({ requests: [], status: 'empty', totalCount: 0 });

    expect(screen.getByText('요청 받은 포트폴리오가 없어요')).toBeInTheDocument();
  });

  it('오류 상태에서 다시 시도하면 onRetry를 호출한다', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    renderList({ onRetry: handleRetry, status: 'error' });

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(handleRetry).toHaveBeenCalled();
  });
});
