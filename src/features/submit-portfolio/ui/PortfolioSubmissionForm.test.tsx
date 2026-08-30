import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { uploadCommonFile } from '@/entities/common-file';

import { PortfolioSubmissionForm } from './PortfolioSubmissionForm';

vi.mock('@/entities/common-file', () => ({
  uploadCommonFile: vi.fn(),
}));

const SUBMISSION_RESPONSE = {
  files: [],
  note: null,
  portfolioUrl: null,
  requestId: 1,
  status: 'SUBMITTED' as const,
  submissionId: 1,
  submittedAt: '2026-09-20T10:00:00',
  updatedAt: '2026-09-20T10:00:00',
};

describe('PortfolioSubmissionForm', () => {
  beforeEach(() => {
    vi.mocked(uploadCommonFile).mockClear();
    vi.mocked(uploadCommonFile).mockResolvedValue({
      contentType: 'application/pdf',
      createdAt: '2026-09-20T09:00:00',
      fileId: 7,
      originalName: 'portfolio.pdf',
      purpose: 'PORTFOLIO',
      size: 1024,
    });
  });

  it('파일을 PORTFOLIO 목적으로 업로드하고 제출 payload에 fileId를 포함한다', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockResolvedValue(SUBMISSION_RESPONSE);
    render(<PortfolioSubmissionForm onSubmit={handleSubmit} />);

    const file = new File(['portfolio'], 'portfolio.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText('첨부할 파일을 선택해 주세요.'), file);

    await waitFor(() =>
      expect(uploadCommonFile).toHaveBeenCalledWith(
        expect.objectContaining({
          file,
          purpose: 'PORTFOLIO',
        }),
      ),
    );
    await waitFor(() => expect(screen.queryByText('업로드 중...')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: '제출하기' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      fileIds: [7],
      note: null,
      portfolioUrl: null,
      status: 'SUBMITTED',
    });
  });

  it('URL과 메모를 임시저장 payload로 전달한다', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockResolvedValue({ ...SUBMISSION_RESPONSE, status: 'DRAFT' });
    render(<PortfolioSubmissionForm onSubmit={handleSubmit} />);

    await user.type(screen.getByRole('textbox', { name: 'URL' }), 'https://example.com');
    await user.type(screen.getByRole('textbox', { name: '메모' }), '링크로 제출합니다.');
    await user.click(screen.getByRole('button', { name: '임시저장' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      fileIds: [],
      note: '링크로 제출합니다.',
      portfolioUrl: 'https://example.com',
      status: 'DRAFT',
    });
  });

  it('파일 용량 초과 상태에서는 제출을 비활성화한다', async () => {
    const user = userEvent.setup();
    render(<PortfolioSubmissionForm onSubmit={vi.fn()} />);

    const file = new File([new Uint8Array(20 * 1024 * 1024 + 1)], 'large.pdf', {
      type: 'application/pdf',
    });
    await user.upload(screen.getByLabelText('첨부할 파일을 선택해 주세요.'), file);

    expect(screen.getByText(/최대 20MB/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '제출하기' })).toBeDisabled();
  });
  it('http/https URL이 아니면 제출하지 않고 오류를 보여준다', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockResolvedValue(SUBMISSION_RESPONSE);
    render(<PortfolioSubmissionForm onSubmit={handleSubmit} />);

    await user.type(screen.getByRole('textbox', { name: 'URL' }), 'ftp://example.com');
    await user.click(screen.getByRole('button', { name: '제출하기' }));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('http 또는 https URL만 입력해 주세요.')).toBeInTheDocument();
  });

  it('제출 기간이 종료되면 파일 업로드를 시작하지 않는다', async () => {
    const user = userEvent.setup();
    const canInteract = vi.fn().mockReturnValue(false);
    const { container } = render(
      <PortfolioSubmissionForm canInteract={canInteract} onSubmit={vi.fn()} />,
    );
    const fileInput = container.querySelector('input[type="file"]');
    if (!(fileInput instanceof HTMLInputElement)) throw new Error('file input not found');

    await user.upload(fileInput, new File(['portfolio'], 'portfolio.pdf'));

    expect(uploadCommonFile).not.toHaveBeenCalled();
    expect(screen.getByText('제출 기간이 종료되었습니다.')).toBeInTheDocument();
  });

  it('제출 기간이 종료되면 저장 요청을 보내지 않는다', async () => {
    const user = userEvent.setup();
    const canInteract = vi.fn().mockReturnValue(false);
    const handleSubmit = vi.fn().mockResolvedValue(SUBMISSION_RESPONSE);
    render(<PortfolioSubmissionForm canInteract={canInteract} onSubmit={handleSubmit} />);

    await user.type(screen.getByRole('textbox', { name: 'URL' }), 'https://example.com');
    await user.click(screen.getByRole('button', { name: '임시저장' }));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('제출 기간이 종료되었습니다.')).toBeInTheDocument();
  });
});
