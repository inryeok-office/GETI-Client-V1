import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InquiryPagination } from './InquiryPagination';

describe('InquiryPagination', () => {
  it('첫 페이지에서는 이전 페이지 버튼의 이름과 비활성 상태를 유지한다', () => {
    render(<InquiryPagination basePath="/inquiries" currentPage={1} totalPages={3} />);

    expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled();
    expect(screen.getByRole('link', { name: '다음 페이지' })).toHaveAttribute(
      'href',
      '/inquiries?page=2',
    );
  });

  it('마지막 페이지에서는 다음 페이지 버튼의 이름과 비활성 상태를 유지한다', () => {
    render(<InquiryPagination basePath="/inquiries" currentPage={3} totalPages={3} />);

    expect(screen.getByRole('link', { name: '이전 페이지' })).toHaveAttribute(
      'href',
      '/inquiries?page=2',
    );
    expect(screen.getByRole('button', { name: '다음 페이지' })).toBeDisabled();
  });
});
