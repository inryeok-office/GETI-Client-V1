import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PortfolioDetailPage } from './PortfolioDetailPage';

const { mockUsePortfolioRequestDetailQuery, mockUseUpsertPortfolioSubmissionMutation } = vi.hoisted(
  () => ({
    mockUsePortfolioRequestDetailQuery: vi.fn(),
    mockUseUpsertPortfolioSubmissionMutation: vi.fn(),
  }),
);

vi.mock('@/entities/common-file', () => ({
  downloadCommonFile: vi.fn(),
  uploadCommonFile: vi.fn(),
}));

vi.mock('@/entities/portfolio-request', async () => {
  const actual = await vi.importActual<typeof import('@/entities/portfolio-request')>(
    '@/entities/portfolio-request',
  );

  return {
    ...actual,
    usePortfolioRequestDetailQuery: mockUsePortfolioRequestDetailQuery,
    useUpsertPortfolioSubmissionMutation: mockUseUpsertPortfolioSubmissionMutation,
  };
});

vi.mock('@/shared/ui/toast', () => ({
  AppToaster: () => null,
  showToast: vi.fn(),
}));

vi.mock('@/widgets/site-header', () => ({
  SiteHeader: () => <header />,
}));

const REQUEST_DETAIL = {
  createdAt: '2026-08-01T00:00:00',
  description: '포트폴리오 제출 요청입니다.',
  dueAt: '2026-01-01T00:00:00',
  requestId: 1,
  status: 'PUBLISHED' as const,
  submittedCount: 0,
  targetCount: 1,
  title: '포트폴리오 제출',
  updatedAt: '2026-08-01T00:00:00',
};

describe('PortfolioDetailPage', () => {
  it('PUBLISHED 요청이어도 마감 시간이 지나면 파일 업로드와 제출을 막는다', () => {
    mockUsePortfolioRequestDetailQuery.mockReturnValue({
      data: REQUEST_DETAIL,
      error: null,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseUpsertPortfolioSubmissionMutation.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
      variables: undefined,
    });

    const { container } = render(<PortfolioDetailPage requestId="1" />);

    expect(container.querySelector('input[type="file"]')).toBeDisabled();
    expect(container.querySelector('input[type="url"]')).toBeDisabled();
    expect(container.querySelector('textarea')).toBeDisabled();
    const actionButtons = Array.from(container.querySelectorAll('button')).filter((button) =>
      button.textContent?.trim(),
    );
    expect(actionButtons).toHaveLength(2);
    expect(actionButtons.every((button) => button.disabled)).toBe(true);
  });
});
