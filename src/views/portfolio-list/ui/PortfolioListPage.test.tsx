import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
});
