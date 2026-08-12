import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { PortfolioSubmissionForm } from './PortfolioSubmissionForm';

describe('PortfolioSubmissionForm', () => {
  it('선택한 파일을 삭제하고 새로운 파일을 추가한다', async () => {
    const user = userEvent.setup();
    render(<PortfolioSubmissionForm />);

    await user.click(screen.getByRole('button', { name: '삭제' }));
    expect(screen.queryByText('제목 없는 디자인 (4).png')).not.toBeInTheDocument();

    const file = new File(['portfolio'], 'portfolio.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText('첨부할 파일을 선택해 주세요.'), file);

    expect(screen.getByText('portfolio.pdf')).toBeInTheDocument();
  });

  it('URL을 엔터로 추가한다', async () => {
    const user = userEvent.setup();
    render(<PortfolioSubmissionForm />);

    const input = screen.getByRole('textbox', { name: 'URL' });
    await user.type(input, 'https://example.com{Enter}');

    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  it('업로드 오류와 용량 초과 상태에서 제출을 비활성화한다', () => {
    const { unmount } = render(<PortfolioSubmissionForm variant="upload-error" />);

    expect(screen.getByText('업로드에 실패했습니다. 다시 시도해 주세요.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '제출하기' })).toBeDisabled();

    unmount();
    render(<PortfolioSubmissionForm variant="size-error" />);
    expect(screen.getByText(/최대 20MB까지/)).toBeInTheDocument();
    expect(screen.getByText('이미 추가된 URL 입니다.')).toBeInTheDocument();
  });

  it('업로드 진행률을 표시한다', () => {
    render(<PortfolioSubmissionForm variant="uploading" />);

    expect(screen.getByText('업로드 중...')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '제출하기' })).toBeDisabled();
  });
});
