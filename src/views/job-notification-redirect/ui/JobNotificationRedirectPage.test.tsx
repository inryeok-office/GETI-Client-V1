import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { JobNotificationRedirectPage } from './JobNotificationRedirectPage';

const { mockReplace, mockUseJobDetailQuery } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockUseJobDetailQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock('@/entities/job', () => ({
  useJobDetailQuery: mockUseJobDetailQuery,
}));

vi.mock('@/widgets/site-header', () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}));

beforeEach(() => {
  mockReplace.mockReset();
  mockUseJobDetailQuery.mockReset();
});

describe('JobNotificationRedirectPage', () => {
  it.each([
    ['INTERNAL', '/jobs/school/7'],
    ['EXTERNAL', '/jobs/external/7'],
  ] as const)('%s 공고의 실제 상세 경로로 이동한다', async (applicationMethod, expected) => {
    mockUseJobDetailQuery.mockReturnValue({
      data: { jobId: 7, applicationMethod },
      isLoading: false,
      isError: false,
    });

    render(<JobNotificationRedirectPage jobId="7" />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(expected));
  });

  it('공고를 조회하는 동안 이동 상태를 표시한다', () => {
    mockUseJobDetailQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<JobNotificationRedirectPage jobId="7" />);

    expect(screen.getByRole('status')).toHaveTextContent('공고 화면으로 이동하고 있습니다.');
  });

  it('올바르지 않은 ID는 조회하지 않고 목록 이동 안내를 표시한다', () => {
    mockUseJobDetailQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    render(<JobNotificationRedirectPage jobId="invalid" />);

    expect(mockUseJobDetailQuery).toHaveBeenCalledWith(null);
    expect(screen.getByText('공고를 확인할 수 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '채용 공고 목록으로' })).toHaveAttribute(
      'href',
      '/jobs',
    );
  });
});
