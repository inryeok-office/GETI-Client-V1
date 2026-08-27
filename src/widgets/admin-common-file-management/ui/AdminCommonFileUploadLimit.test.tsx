import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { CommonFilePurpose, CommonFileUploadApiResponse } from '@/entities/common-file';

import { AdminCommonFileManagement } from './AdminCommonFileManagement';

function createUploadResponse(fileId = 99): CommonFileUploadApiResponse {
  return {
    contentType: 'application/pdf',
    createdAt: '2026-08-27T12:00:00',
    fileId,
    originalName: 'resume.pdf',
    purpose: 'JOB_ATTACHMENT',
    size: 6,
  };
}

function renderManagement({
  onUploadFile,
}: {
  onUploadFile: (
    file: File,
    purpose: CommonFilePurpose,
    onProgress: (progress: number) => void,
    signal: AbortSignal,
  ) => Promise<CommonFileUploadApiResponse>;
}) {
  const view = render(
    <AdminCommonFileManagement
      files={[]}
      isDownloading={false}
      isFirstPage
      isLastPage
      listStatus="empty"
      page={0}
      purposeFilter="ALL"
      searchQuery=""
      statusFilter="ALL"
      totalPages={1}
      onDownloadFiles={vi.fn().mockResolvedValue(undefined)}
      onPageChange={vi.fn()}
      onPurposeFilterChange={vi.fn()}
      onRetry={vi.fn()}
      onSearchChange={vi.fn()}
      onStatusFilterChange={vi.fn()}
      onUploadComplete={vi.fn().mockResolvedValue(undefined)}
      onUploadFile={onUploadFile}
    />,
  );

  const fileInput = view.container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!fileInput) throw new Error('file input not found');

  return { fileInput };
}

describe('AdminCommonFileManagement upload limit', () => {
  it('이미 성공한 업로드 개수까지 포함해 목적별 최대 개수를 제한한다', async () => {
    const onUploadFile = vi.fn().mockImplementation((_file, _purpose, onProgress) => {
      onProgress(100);
      return Promise.resolve(createUploadResponse());
    });
    const { fileInput } = renderManagement({ onUploadFile });

    fireEvent.change(fileInput, {
      target: {
        files: Array.from(
          { length: 5 },
          (_, index) => new File(['resume'], `resume-${index}.pdf`, { type: 'application/pdf' }),
        ),
      },
    });

    await waitFor(() => expect(onUploadFile).toHaveBeenCalledTimes(5));

    fireEvent.change(fileInput, {
      target: { files: [new File(['resume'], 'resume-6.pdf', { type: 'application/pdf' })] },
    });

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(onUploadFile).toHaveBeenCalledTimes(5);
  });
});
