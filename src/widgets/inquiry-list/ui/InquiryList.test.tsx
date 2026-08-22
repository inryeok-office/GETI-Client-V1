import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InquiryList } from './InquiryList';

describe('InquiryList', () => {
  it('빈 상태를 표시한다', () => {
    render(
      <InquiryList
        basePath="/inquiries"
        currentPage={1}
        inquiries={[]}
        status="empty"
        totalPages={0}
        onRetry={() => undefined}
      />,
    );
    expect(screen.getByText('아직 등록된 문의가 없습니다.')).toBeInTheDocument();
  });

  it('에러 상태에서 재시도 동작을 실행한다', () => {
    let retryCount = 0;
    render(
      <InquiryList
        basePath="/inquiries"
        currentPage={1}
        inquiries={[]}
        status="error"
        totalPages={0}
        onRetry={() => {
          retryCount += 1;
        }}
      />,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(retryCount).toBe(1);
  });

  it('로딩 상태를 알린다', () => {
    render(
      <InquiryList
        basePath="/inquiries"
        currentPage={1}
        inquiries={[]}
        status="loading"
        totalPages={0}
        onRetry={() => undefined}
      />,
    );
    expect(screen.getByRole('status', { name: '문의 목록을 불러오는 중' })).toBeInTheDocument();
  });

  it('현재 페이지와 이전·다음 페이지 링크를 표시한다', () => {
    render(
      <InquiryList
        basePath="/inquiries"
        currentPage={2}
        inquiries={[
          {
            inquiryId: '25',
            inquiryType: 'ERROR',
            title: '문의 제목',
            status: 'RECEIVED',
            createdAt: '2026-08-22T10:00:00',
          },
        ]}
        status="success"
        totalPages={3}
        onRetry={() => undefined}
      />,
    );

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '문의 제목' })).toHaveAttribute(
      'href',
      '/inquiries/25?returnPage=2',
    );
    expect(screen.getByRole('link', { name: '이전 페이지' })).toHaveAttribute(
      'href',
      '/inquiries?page=1',
    );
    expect(screen.getByRole('link', { name: '다음 페이지' })).toHaveAttribute(
      'href',
      '/inquiries?page=3',
    );
  });
});
