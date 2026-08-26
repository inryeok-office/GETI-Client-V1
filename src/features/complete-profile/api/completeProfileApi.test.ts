import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CompleteProfileRequest } from '../model/types';
import { completeProfile, uploadProfileImage } from './completeProfileApi';

const {
  mockFetchSession,
  mockReplaceMyMajors,
  mockReplaceMyTechStacks,
  mockUpdateMyProfile,
  mockUploadCommonFile,
} = vi.hoisted(() => ({
  mockFetchSession: vi.fn(),
  mockReplaceMyMajors: vi.fn(),
  mockReplaceMyTechStacks: vi.fn(),
  mockUpdateMyProfile: vi.fn(),
  mockUploadCommonFile: vi.fn(),
}));

vi.mock('@/entities/common-file', () => ({ uploadCommonFile: mockUploadCommonFile }));
vi.mock('@/entities/member', () => ({
  replaceMyMajors: mockReplaceMyMajors,
  replaceMyTechStacks: mockReplaceMyTechStacks,
  updateMyProfile: mockUpdateMyProfile,
}));
vi.mock('@/entities/session', () => ({ fetchSession: mockFetchSession }));

const REQUEST: CompleteProfileRequest = {
  department: 'SMART_IOT',
  desiredJob: 'UXUI 디자이너',
  majorIds: [2],
  phone: null,
  profileImageFileId: 77,
  techStackIds: [11],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockReplaceMyMajors.mockResolvedValue(undefined);
  mockReplaceMyTechStacks.mockResolvedValue(undefined);
  mockUpdateMyProfile.mockResolvedValue(undefined);
  mockFetchSession.mockResolvedValue({ memberId: 1, roles: ['STUDENT'] });
});

describe('completeProfileApi', () => {
  it('프로필 이미지를 PROFILE_IMAGE 용도로 업로드한다', async () => {
    const file = new File(['image'], 'profile.png', { type: 'image/png' });
    mockUploadCommonFile.mockResolvedValue({ fileId: 77 });

    await uploadProfileImage(file);

    expect(mockUploadCommonFile).toHaveBeenCalledWith(file, 'PROFILE_IMAGE');
  });

  it('전공·기술 스택·프로필을 저장한 뒤 최신 세션을 반환한다', async () => {
    await expect(completeProfile(REQUEST)).resolves.toEqual({
      memberId: 1,
      roles: ['STUDENT'],
    });

    expect(mockReplaceMyMajors).toHaveBeenCalledWith([2]);
    expect(mockReplaceMyTechStacks).toHaveBeenCalledWith([11]);
    expect(mockUpdateMyProfile).toHaveBeenCalledWith({
      department: 'SMART_IOT',
      desiredJob: 'UXUI 디자이너',
      phone: null,
      profileImageFileId: 77,
    });
    expect(mockFetchSession).toHaveBeenCalledOnce();
    expect(mockReplaceMyMajors.mock.invocationCallOrder[0]).toBeLessThan(
      mockReplaceMyTechStacks.mock.invocationCallOrder[0],
    );
    expect(mockReplaceMyTechStacks.mock.invocationCallOrder[0]).toBeLessThan(
      mockUpdateMyProfile.mock.invocationCallOrder[0],
    );
    expect(mockUpdateMyProfile.mock.invocationCallOrder[0]).toBeLessThan(
      mockFetchSession.mock.invocationCallOrder[0],
    );
  });

  it('중간 저장이 실패하면 이후 요청과 세션 갱신을 실행하지 않는다', async () => {
    mockReplaceMyTechStacks.mockRejectedValueOnce(new Error('failed'));

    await expect(completeProfile(REQUEST)).rejects.toThrow('failed');

    expect(mockUpdateMyProfile).not.toHaveBeenCalled();
    expect(mockFetchSession).not.toHaveBeenCalled();
  });
});
