import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ApplicationAttachment } from '@/entities/job-application';

import { AttachmentUploadSection } from './AttachmentUploadSection';

function file(name = 'resume.pdf', type = 'application/pdf') {
  return new File(['content'], name, { type });
}

describe('AttachmentUploadSection', () => {
  it('문항의 title · description을 그대로 보여준다', () => {
    render(
      <AttachmentUploadSection
        title="포트폴리오"
        description="PDF로 첨부해 주세요."
        attachments={[]}
        onAddFiles={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: '포트폴리오' })).toBeInTheDocument();
    expect(screen.getByText('PDF로 첨부해 주세요.')).toBeInTheDocument();
  });

  it('파일을 선택하면 onAddFiles에 FileList를 넘긴다', () => {
    const onAddFiles = vi.fn();
    const { container } = render(
      <AttachmentUploadSection
        title="포트폴리오"
        description={null}
        attachments={[]}
        onAddFiles={onAddFiles}
        onRemove={vi.fn()}
      />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file()] } });

    expect(onAddFiles).toHaveBeenCalledTimes(1);
    expect(onAddFiles.mock.calls[0][0]).toHaveLength(1);
    expect(onAddFiles.mock.calls[0][0][0].name).toBe('resume.pdf');
  });

  it('업로드된 파일 목록을 보여주고 삭제 버튼으로 onRemove를 호출한다', () => {
    const onRemove = vi.fn();
    const attachments: ApplicationAttachment[] = [
      { id: 'a1', fileName: 'resume.pdf', fileSize: '1.6 MB', uploadError: null, fileId: 10 },
    ];
    render(
      <AttachmentUploadSection
        title="포트폴리오"
        description={null}
        attachments={attachments}
        onAddFiles={vi.fn()}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.6 MB')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onRemove).toHaveBeenCalledWith('a1');
  });

  it('업로드 오류가 있는 파일은 오류 사유 라벨을 함께 보여준다', () => {
    const attachments: ApplicationAttachment[] = [
      {
        id: 'a1',
        fileName: 'huge.pdf',
        fileSize: '20.0 MB',
        uploadError: 'sizeExceeded',
        fileId: null,
      },
    ];
    render(
      <AttachmentUploadSection
        title="포트폴리오"
        description={null}
        attachments={attachments}
        onAddFiles={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText('용량 초과')).toBeInTheDocument();
  });
});
