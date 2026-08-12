import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { PortfolioRequestListItem } from '@/entities/portfolio-request';

import { PortfolioRequestList } from './PortfolioRequestList';

const REQUESTS: PortfolioRequestListItem[] = [
  {
    dDay: 4,
    description: '프로젝트 결과물을 제출해 주세요.',
    duePeriod: '2026.08.05 09:00 ~ 2026.08.17 23:59',
    registeredAt: '2026.07.30',
    requestId: '1',
    status: 'REQUIRED',
    title: '제출이 필요한 포트폴리오',
  },
  {
    dDay: null,
    description: '프로젝트 결과물을 제출해 주세요.',
    duePeriod: '2026.08.05 09:00 ~ 2026.08.17 23:59',
    registeredAt: '2026.07.30',
    requestId: '2',
    status: 'SUBMITTED',
    title: '제출한 포트폴리오',
  },
  {
    dDay: null,
    description: '프로젝트 결과물을 제출해 주세요.',
    duePeriod: '2026.08.05 09:00 ~ 2026.08.17 23:59',
    registeredAt: '2026.07.30',
    requestId: '3',
    status: 'CLOSED',
    title: '마감된 포트폴리오',
  },
];

describe('PortfolioRequestList', () => {
  it('요청 개수와 상태별 카드를 표시한다', () => {
    render(<PortfolioRequestList initialStatus="success" requests={REQUESTS} />);

    expect(screen.getByText('1', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getByRole('link', { name: '제출하기' })).toHaveAttribute('href', '/portfolios/1');
  });

  it('선택한 제출 상태로 목록을 필터링한다', async () => {
    const user = userEvent.setup();
    render(<PortfolioRequestList initialStatus="success" requests={REQUESTS} />);

    await user.click(screen.getByRole('button', { name: '제출 완료 1' }));

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(1);
    expect(within(articles[0]).getByText('제출한 포트폴리오')).toBeInTheDocument();
  });

  it('빈 목록 상태를 표시한다', () => {
    render(<PortfolioRequestList initialStatus="empty" requests={[]} />);

    expect(screen.getByText('요청 받은 포트폴리오가 없어요.')).toBeInTheDocument();
  });

  it('오류 상태에서 다시 시도하면 목록을 표시한다', async () => {
    const user = userEvent.setup();
    render(<PortfolioRequestList initialStatus="error" requests={REQUESTS} />);

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getAllByRole('article')).toHaveLength(3);
  });
});
