import { beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadCommonFile, fetchAdminCommonFileList, uploadCommonFile } from './commonFileApi';

const { mockGet, mockPost } = vi.hoisted(() => ({ mockGet: vi.fn(), mockPost: vi.fn() }));

vi.mock('@/shared/api', () => ({ api: { get: mockGet, post: mockPost } }));

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
});

describe('commonFileApi', () => {
  it('관리자 파일 목록을 검색·필터·페이지 조건과 함께 조회한다', async () => {
    const responseData = { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(
      fetchAdminCommonFileList({ originalName: '이력서', purpose: 'JOB_APPLICATION' }),
    ).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/files', {
      params: { page: 0, size: 20, originalName: '이력서', purpose: 'JOB_APPLICATION' },
    });
  });

  it('파일과 목적을 multipart 요청으로 업로드하고 진행률을 전달한다', async () => {
    const onProgress = vi.fn();
    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
    const responseData = { fileId: 1, originalName: 'resume.pdf' };
    mockPost.mockImplementation((_url, _body, config) => {
      config.onUploadProgress({ loaded: 5, total: 10 });
      return Promise.resolve({ data: { success: true, data: responseData } });
    });

    await expect(uploadCommonFile({ file, purpose: 'JOB_APPLICATION', onProgress })).resolves.toBe(
      responseData,
    );
    expect(mockPost).toHaveBeenCalledWith('/api/v1/files', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: expect.any(Function),
    });
    const formData = mockPost.mock.calls[0][1] as FormData;
    expect(formData.get('file')).toBe(file);
    expect(formData.get('purpose')).toBe('JOB_APPLICATION');
    expect(onProgress).toHaveBeenNthCalledWith(1, 50);
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });

  it('파일 다운로드를 인증된 Blob 요청으로 처리한다', async () => {
    const blob = new Blob(['file']);
    mockGet.mockResolvedValue({ data: blob });

    await expect(downloadCommonFile(7)).resolves.toBe(blob);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/files/7/download', { responseType: 'blob' });
  });
});
