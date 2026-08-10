import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InquiryList } from './InquiryList';

describe('InquiryList', () => {
  it('빈 상태를 표시한다', () => {
    render(<InquiryList inquiries={[]} status="empty" />);
    expect(screen.getByText('아직 등록된 문의가 없습니다.')).toBeInTheDocument();
  });

  it('에러 상태와 재시도 버튼을 표시한다', () => {
    render(<InquiryList inquiries={[]} status="error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('로딩 상태를 알린다', () => {
    render(<InquiryList inquiries={[]} status="loading" />);
    expect(screen.getByRole('status', { name: '문의 목록을 불러오는 중' })).toBeInTheDocument();
  });
});
