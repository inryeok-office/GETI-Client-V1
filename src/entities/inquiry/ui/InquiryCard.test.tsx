import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InquiryCard } from './InquiryCard';

describe('InquiryCard', () => {
  it('문의 요약과 상세 링크를 표시한다', () => {
    render(
      <InquiryCard
        inquiry={{
          inquiryId: '25',
          inquiryType: 'ERROR',
          title: '문의 제목',
          status: 'ANSWERED',
          createdAt: '2026-08-09T10:00:00',
        }}
      />,
    );

    expect(screen.getByRole('link', { name: '문의 제목' })).toHaveAttribute(
      'href',
      '/inquiries/25',
    );
    expect(screen.getByText('등록일 2026.08.09')).toBeInTheDocument();
    expect(screen.getByText('답변 완료')).toBeInTheDocument();
  });

  it('처리 중인 문의를 답변 대기로 표시한다', () => {
    render(
      <InquiryCard
        inquiry={{
          inquiryId: '26',
          inquiryType: 'INCONVENIENCE',
          title: '처리 중 문의',
          status: 'IN_PROGRESS',
          createdAt: '2026-08-09T10:00:00',
        }}
      />,
    );

    expect(screen.getByText('답변 대기')).toBeInTheDocument();
  });

  it('종료된 문의를 답변 완료로 단정하지 않고 문의 종료로 표시한다', () => {
    render(
      <InquiryCard
        inquiry={{
          inquiryId: '27',
          inquiryType: 'ETC',
          title: '종료된 문의',
          status: 'CLOSED',
          createdAt: '2026-08-09T10:00:00',
        }}
      />,
    );

    expect(screen.getByText('문의 종료')).toBeInTheDocument();
    expect(screen.queryByText('답변 완료')).not.toBeInTheDocument();
  });
});
