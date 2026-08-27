import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type {
  CommonFileItem,
  CommonFilePurpose,
  CommonFileUploadApiResponse,
} from '@/entities/common-file';

import {
  AdminCommonFileManagement,
  type AdminCommonFileListStatus,
} from './AdminCommonFileManagement';

const FILES: CommonFileItem[] = [
  {
    fileId: 1,
    isDownloadAvailable: true,
    name: '포트폴리오.pdf',
    purpose: 'PORTFOLIO',
    size: '8.4MB',
    status: 'LINKED',
    uploader: '김학생',
    uploadedAt: '2026.08.01',
    usage: '포트폴리오 제출 #3',
  },
  {
    fileId: 2,
    isDownloadAvailable: false,
    name: '지원서.docx',
    purpose: 'JOB_APPLICATION',
    size: '1.2MB',
    status: 'FAILED',
    uploader: '이선생',
    uploadedAt: '2026.07.30',
    usage: '연결 전',
  },
];

function renderManagement({
  files = FILES,
  listStatus = 'success',
  onDownloadFiles = vi.fn().mockResolvedValue(undefined),
  onUploadComplete = vi.fn().mockResolvedValue(undefined),
  onUploadFile = vi.fn().mockResolvedValue(createUploadResponse()),
}: {
  files?: CommonFileItem[];
  listStatus?: AdminCommonFileListStatus;
  onDownloadFiles?: (fileIds: number[]) => Promise<void>;
  onUploadComplete?: () => Promise<void>;
  onUploadFile?: (
    file: File,
    purpose: CommonFilePurpose,
    onProgress: (progress: number) => void,
    signal: AbortSignal,
  ) => Promise<CommonFileUploadApiResponse>;
} = {}) {
  render(
    <AdminCommonFileManagement
      files={files}
      isDownloading={false}
      isFirstPage
      isLastPage
      listStatus={listStatus}
      page={0}
      purposeFilter="ALL"
      searchQuery=""
      statusFilter="ALL"
      totalPages={1}
      onDownloadFiles={onDownloadFiles}
      onPageChange={vi.fn()}
      onPurposeFilterChange={vi.fn()}
      onRetry={vi.fn()}
      onSearchChange={vi.fn()}
      onStatusFilterChange={vi.fn()}
      onUploadComplete={onUploadComplete}
      onUploadFile={onUploadFile}
    />,
  );
}

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

describe('AdminCommonFileManagement', () => {
  it('다운로드 가능한 파일만 선택하고 일괄 다운로드한다', async () => {
    const onDownloadFiles = vi.fn().mockResolvedValue(undefined);
    renderManagement({ onDownloadFiles });

    fireEvent.click(screen.getByRole('checkbox', { name: '포트폴리오.pdf 선택' }));
    expect(screen.getByText('선택한 파일 1개')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '지원서.docx 선택' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '선택 파일 다운로드' }));
    await waitFor(() => expect(onDownloadFiles).toHaveBeenCalledWith([1]));
  });

  it('잘못된 파일만 실패로 표시하고 정상 파일은 계속 업로드한다', async () => {
    const onUploadComplete = vi.fn().mockResolvedValue(undefined);
    const onUploadFile = vi.fn().mockResolvedValue(createUploadResponse());
    renderManagement({ onUploadComplete, onUploadFile });
    const validFile = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
    const invalidFile = new File(['document'], 'document.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    fireEvent.change(screen.getByLabelText('첨부할 파일을 선택해 주세요.'), {
      target: { files: [validFile, invalidFile] },
    });

    await waitFor(() => expect(onUploadFile).toHaveBeenCalledOnce());
    expect(onUploadFile.mock.calls[0]?.[0]).toBe(validFile);
    expect(screen.getByText('허용되지 않는 파일 형식입니다.')).toBeInTheDocument();
    expect(screen.getByText('업로드 완료 · 연결 전')).toBeInTheDocument();
    expect(screen.getByText(/임시 파일 ID #99/)).toBeInTheDocument();
    expect(screen.getByText('실패')).toBeInTheDocument();
    expect(onUploadComplete).toHaveBeenCalledOnce();
  });

  it('선택한 파일과 목적을 업로드 콜백에 전달한다', async () => {
    const onUploadFile = vi.fn().mockResolvedValue(createUploadResponse(101));
    renderManagement({ onUploadFile });
    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });

    fireEvent.change(screen.getByLabelText('첨부할 파일을 선택해 주세요.'), {
      target: { files: [file] },
    });

    await waitFor(() => expect(onUploadFile).toHaveBeenCalledTimes(1));
    expect(onUploadFile.mock.calls[0]?.[0]).toBe(file);
    expect(onUploadFile.mock.calls[0]?.[1]).toBe('JOB_ATTACHMENT');
    expect(await screen.findByText('업로드 완료 · 연결 전')).toBeInTheDocument();
    expect(screen.getByText(/임시 파일 ID #101/)).toBeInTheDocument();
  });

  it('선택한 목적에 맞춰 허용 형식·개수·용량 안내를 변경한다', () => {
    renderManagement();
    const fileInput = screen.getByLabelText('첨부할 파일을 선택해 주세요.');

    expect(fileInput).toHaveAttribute('accept', '.pdf,.png,.jpg,.jpeg');
    expect(screen.getByText('PDF, PNG, JPG, JPEG · 최대 5개 · 파일당 10MB')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('combobox', { name: '업로드 목적' }));
    fireEvent.click(screen.getByRole('option', { name: '문의 첨부' }));

    expect(fileInput).toHaveAttribute('accept', '.png,.jpg,.jpeg,.pdf');
    expect(screen.getByText('PNG, JPG, JPEG, PDF · 최대 3개 · 파일당 5MB')).toBeInTheDocument();
  });

  it('한 파일이 실패해도 다음 파일을 업로드하고 파일별 결과를 표시한다', async () => {
    const onUploadFile = vi
      .fn()
      .mockRejectedValueOnce(new Error('첫 번째 파일 업로드 실패'))
      .mockResolvedValueOnce(createUploadResponse(102));
    renderManagement({ onUploadFile });
    const firstFile = new File(['first'], 'first.pdf', { type: 'application/pdf' });
    const secondFile = new File(['second'], 'second.pdf', { type: 'application/pdf' });

    fireEvent.change(screen.getByLabelText('첨부할 파일을 선택해 주세요.'), {
      target: { files: [firstFile, secondFile] },
    });

    await waitFor(() => expect(onUploadFile).toHaveBeenCalledTimes(2));
    expect(screen.getByText('첫 번째 파일 업로드 실패')).toBeInTheDocument();
    expect(screen.getAllByText('실패')).toHaveLength(1);
    expect(screen.getByText('업로드 완료 · 연결 전')).toBeInTheDocument();
  });

  it.each([
    ['loading', '파일을 불러오는 중입니다.'],
    ['error', '파일을 불러올 수 없습니다.'],
    ['empty', '등록된 파일이 없습니다.'],
  ] as const)('%s 목록 상태를 표시한다', (listStatus, title) => {
    renderManagement({ files: [], listStatus });
    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
