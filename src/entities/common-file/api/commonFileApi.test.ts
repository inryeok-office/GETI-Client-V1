import { beforeEach, describe, expect, it, vi } from 'vitest';

import { uploadCommonFile } from './commonFileApi';

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }));

vi.mock('@/shared/api', () => ({
  api: { post: mockPost },
}));

beforeEach(() => {
  mockPost.mockReset();
});

describe('commonFileApi', () => {
  it('파일과 용도를 multipart 요청으로 전달하고 업로드 결과를 반환한다', async () => {
    const file = new File(['image'], 'profile.png', { type: 'image/png' });
    const uploadedFile = {
      fileId: 77,
      originalName: 'profile.png',
      contentType: 'image/png',
      size: 5,
      purpose: 'PROFILE_IMAGE' as const,
      createdAt: '2026-08-26T00:00:00Z',
    };
    mockPost.mockResolvedValue({ data: { success: true, data: uploadedFile } });

    await expect(uploadCommonFile(file, 'PROFILE_IMAGE')).resolves.toBe(uploadedFile);

    const [url, body, config] = mockPost.mock.calls[0] ?? [];
    expect(url).toBe('/api/v1/files');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBe(file);
    expect(config).toEqual({
      params: { purpose: 'PROFILE_IMAGE' },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });
});
