import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InquiryDetailContent } from './InquiryDetailContent';

describe('InquiryDetailContent', () => {
  it('문의 내용과 등록된 답변을 표시한다', () => {
    render(
      <InquiryDetailContent
        inquiry={{
          inquiryId: '1',
          title: '문의 제목',
          status: 'ANSWERED',
          createdAt: '2026-08-08T10:00:00',
          content: '문의 내용입니다.',
          answer: { content: '답변 내용입니다.', createdAt: '2026-08-09T10:00:00' },
        }}
      />,
    );

    expect(screen.getByText('문의 내용입니다.')).toBeInTheDocument();
    expect(screen.getByText('답변 내용입니다.')).toBeInTheDocument();
    expect(screen.getByText('답변일 2026.08.09')).toBeInTheDocument();
  });

  it('답변이 없으면 대기 안내를 표시한다', () => {
    render(
      <InquiryDetailContent
        inquiry={{
          inquiryId: '2',
          title: '문의 제목',
          status: 'RECEIVED',
          createdAt: '2026-08-08T10:00:00',
          content: '문의 내용입니다.',
          answer: null,
        }}
      />,
    );

    expect(screen.getByText('아직 등록된 답변이 없습니다.')).toBeInTheDocument();
  });
});
