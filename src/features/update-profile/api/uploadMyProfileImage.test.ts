import { describe, expect, it, vi } from 'vitest';

import { uploadMyProfileImage } from './uploadMyProfileImage';

const { mockUploadCommonFile } = vi.hoisted(() => ({ mockUploadCommonFile: vi.fn() }));

vi.mock('@/entities/common-file', () => ({ uploadCommonFile: mockUploadCommonFile }));

describe('uploadMyProfileImage', () => {
  it('선택한 이미지를 PROFILE_IMAGE 용도로 업로드한다', async () => {
    const file = new File(['image'], 'profile.webp', { type: 'image/webp' });
    const uploadedFile = { fileId: 77, purpose: 'PROFILE_IMAGE' };
    mockUploadCommonFile.mockResolvedValue(uploadedFile);

    await expect(uploadMyProfileImage(file)).resolves.toBe(uploadedFile);
    expect(mockUploadCommonFile).toHaveBeenCalledWith(file, 'PROFILE_IMAGE');
  });
});
