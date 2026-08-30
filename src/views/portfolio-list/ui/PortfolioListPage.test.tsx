import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PortfolioListPage } from './PortfolioListPage';

const mockUseAllPortfolioRequestListQuery = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  usePathname: () => '/portfolios',
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/entities/portfolio-request', async () => {
  const actual = await vi.importActual<typeof import('@/entities/portfolio-request')>(
    '@/entities/portfolio-request',
  );

  return { ...actual, useAllPortfolioRequestListQuery: mockUseAllPortfolioRequestListQuery };
});

vi.mock('@/widgets/site-header', () => ({ SiteHeader: () => <header /> }));

describe('PortfolioListPage', () => {
  beforeEach(() => {
    mockUseAllPortfolioRequestListQuery.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('filters before paginating across server page boundaries', () => {
    mockUseAllPortfolioRequestListQuery.mockReturnValue({
      data: [
        ...Array.from({ length: 20 }, (_, index) => ({
          dueAt: '2026-08-29T23:59:59',
          requestId: index + 1,
          status: 'PUBLISHED' as const,
          submittedCount: 0,
          targetCount: 1,
          title: `closed-${index + 1}`,
        })),
        {
          dueAt: '2026-09-01T23:59:59',
          requestId: 21,
          status: 'PUBLISHED' as const,
          submittedCount: 0,
          targetCount: 1,
          title: 'required-request',
        },
      ],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<PortfolioListPage initialFilter="required" />);

    expect(screen.getByText('required-request')).toBeInTheDocument();
    expect(screen.queryByText('closed-1')).not.toBeInTheDocument();
  });

  it('목록을 열어둔 상태에서 dueAt이 지나면 제출 필요 요청을 마감으로 갱신한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-29T09:59:59'));
    mockUseAllPortfolioRequestListQuery.mockReturnValue({
      data: [
        {
          dueAt: '2026-08-29T10:00:00',
          requestId: 1,
          status: 'PUBLISHED' as const,
          submittedCount: 0,
          targetCount: 1,
          title: '곧 마감되는 요청',
        },
      ],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<PortfolioListPage initialFilter="required" />);

    expect(screen.getByText('곧 마감되는 요청')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1_002);
    });

    expect(screen.queryByText('곧 마감되는 요청')).not.toBeInTheDocument();
    expect(screen.getByText('해당 상태의 포트폴리오가 없어요')).toBeInTheDocument();
  });
});
