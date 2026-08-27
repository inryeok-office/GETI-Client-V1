import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CommonFileListApiResponse } from '@/entities/common-file';
import { ApiError } from '@/shared/api';

import { AdminCommonFileManagementPage } from './AdminCommonFileManagementPage';

const {
  mockDownload,
  mockListRefetch,
  mockReplace,
  mockShowToast,
  mockUpload,
  mockUseDownloadMutation,
  mockUseListQuery,
  mockUseUploadMutation,
} = vi.hoisted(() => ({
  mockDownload: vi.fn(),
  mockListRefetch: vi.fn(),
  mockReplace: vi.fn(),
  mockShowToast: vi.fn(),
  mockUpload: vi.fn(),
  mockUseDownloadMutation: vi.fn(),
  mockUseListQuery: vi.fn(),
  mockUseUploadMutation: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/files',
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock('@/entities/common-file', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/common-file')>();
  return {
    ...actual,
    useAdminCommonFileListQuery: mockUseListQuery,
    useDownloadCommonFileMutation: mockUseDownloadMutation,
    useUploadCommonFileMutation: mockUseUploadMutation,
  };
});

vi.mock('@/shared/ui/toast', () => ({
  AppToaster: () => null,
  showToast: mockShowToast,
}));

const LIST_RESPONSE: CommonFileListApiResponse = {
  content: [
    {
      contentType: 'application/pdf',
      createdAt: '2026-08-20T09:00:00',
      fileId: 1,
      originalName: '포트폴리오.pdf',
      ownerId: 3,
      ownerType: 'PORTFOLIO_SUBMISSION',
      purpose: 'PORTFOLIO',
      sizeBytes: 1024,
      status: 'LINKED',
      uploader: { memberId: 7, name: '김학생' },
    },
  ],
  first: true,
  last: true,
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
};

beforeEach(() => {
  mockDownload.mockReset();
  mockListRefetch.mockReset();
  mockReplace.mockReset();
  mockShowToast.mockReset();
  mockUpload.mockReset();
  mockUseListQuery.mockReturnValue({
    data: LIST_RESPONSE,
    isError: false,
    isLoading: false,
    isPlaceholderData: false,
    refetch: mockListRefetch,
  });
  mockUseUploadMutation.mockReturnValue({ isPending: false, mutateAsync: mockUpload });
  mockUseDownloadMutation.mockReturnValue({ isPending: false, mutateAsync: mockDownload });
});

describe('AdminCommonFileManagementPage', () => {
  it('URL 조건을 관리자 파일 목록 Query에 반영한다', () => {
    render(
      <AdminCommonFileManagementPage
        initialSearchParams={{
          originalName: '포트폴리오',
          page: '2',
          purpose: 'PORTFOLIO',
          status: 'LINKED',
        }}
      />,
    );

    expect(mockUseListQuery).toHaveBeenCalledWith({
      originalName: '포트폴리오',
      page: 1,
      purpose: 'PORTFOLIO',
      size: 20,
      status: 'LINKED',
    });
  });

  it('파일명 검색을 Query와 URL에 반영한다', async () => {
    render(<AdminCommonFileManagementPage />);

    fireEvent.change(screen.getByLabelText('파일명 검색'), {
      target: { value: '지원서' },
    });
    fireEvent.click(screen.getByRole('button', { name: '파일 검색' }));

    expect(mockUseListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ originalName: '지원서', page: 0 }),
    );
    await waitFor(() => {
      expect(mockReplace).toHaveBeenLastCalledWith(
        '/admin/files?originalName=%EC%A7%80%EC%9B%90%EC%84%9C',
        {
          scroll: false,
        },
      );
    });
  });

  it('목록 오류의 다시 시도를 Query refetch에 연결한다', () => {
    mockUseListQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      isPlaceholderData: false,
      refetch: mockListRefetch,
    });
    render(<AdminCommonFileManagementPage />);

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(mockListRefetch).toHaveBeenCalledOnce();
  });

  it('다음 페이지를 Query와 URL에 반영한다', async () => {
    mockUseListQuery.mockReturnValue({
      data: { ...LIST_RESPONSE, last: false, totalElements: 21, totalPages: 2 },
      isError: false,
      isLoading: false,
      isPlaceholderData: false,
      refetch: mockListRefetch,
    });
    render(<AdminCommonFileManagementPage />);

    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    expect(mockUseListQuery).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenLastCalledWith('/admin/files?page=2', { scroll: false });
    });
  });

  it('선택한 파일을 목적과 함께 순서대로 업로드한다', async () => {
    mockUpload
      .mockResolvedValueOnce({
        contentType: 'application/pdf',
        createdAt: '2026-08-27T12:00:00',
        fileId: 2,
        originalName: 'first.pdf',
        purpose: 'JOB_ATTACHMENT',
        size: 5,
      })
      .mockResolvedValueOnce({
        contentType: 'application/pdf',
        createdAt: '2026-08-27T12:00:01',
        fileId: 3,
        originalName: 'second.pdf',
        purpose: 'JOB_ATTACHMENT',
        size: 6,
      });
    render(<AdminCommonFileManagementPage />);
    const firstFile = new File(['first'], 'first.pdf', { type: 'application/pdf' });
    const secondFile = new File(['second'], 'second.pdf', { type: 'application/pdf' });

    fireEvent.change(screen.getByLabelText('첨부할 파일을 선택해 주세요.'), {
      target: { files: [firstFile, secondFile] },
    });

    await waitFor(() => expect(mockUpload).toHaveBeenCalledTimes(2));
    expect(mockUpload.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ file: firstFile, purpose: 'JOB_ATTACHMENT' }),
    );
    expect(mockUpload.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({ file: secondFile, purpose: 'JOB_ATTACHMENT' }),
    );
    expect(mockListRefetch).toHaveBeenCalledOnce();
    expect(mockShowToast).toHaveBeenCalledWith({
      tone: 'success',
      message: '2개 파일을 업로드했습니다.',
    });
  });

  it('개별 파일 다운로드 실패를 안내한다', async () => {
    mockDownload.mockRejectedValue(new Error('download failed'));
    render(<AdminCommonFileManagementPage />);

    fireEvent.click(screen.getByRole('button', { name: '포트폴리오.pdf 다운로드' }));

    await waitFor(() => expect(mockDownload).toHaveBeenCalledWith(1));
    expect(mockShowToast).toHaveBeenCalledWith({
      tone: 'error',
      message: '파일을 다운로드할 수 없습니다.',
    });
  });

  it('서버가 파일 접근을 거부하면 권한 오류를 안내한다', async () => {
    mockDownload.mockRejectedValue(
      new ApiError('접근 권한이 없습니다.', 403, 'FILE_ACCESS_DENIED'),
    );
    render(<AdminCommonFileManagementPage />);

    fireEvent.click(screen.getByRole('button', { name: '포트폴리오.pdf 다운로드' }));

    await waitFor(() => expect(mockDownload).toHaveBeenCalledWith(1));
    expect(mockShowToast).toHaveBeenCalledWith({
      tone: 'error',
      message: '파일 다운로드 권한이 없습니다.',
    });
  });
});
