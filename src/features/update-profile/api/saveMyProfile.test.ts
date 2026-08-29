import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SaveMyProfileRequest } from '../model/types';
import { saveMyProfile } from './saveMyProfile';

const { mockFetchMyProfile, mockReplaceMyMajors, mockReplaceMyTechStacks, mockUpdateMyProfile } =
  vi.hoisted(() => ({
    mockFetchMyProfile: vi.fn(),
    mockReplaceMyMajors: vi.fn(),
    mockReplaceMyTechStacks: vi.fn(),
    mockUpdateMyProfile: vi.fn(),
  }));

vi.mock('@/entities/member', () => ({
  fetchMyProfile: mockFetchMyProfile,
  replaceMyMajors: mockReplaceMyMajors,
  replaceMyTechStacks: mockReplaceMyTechStacks,
  updateMyProfile: mockUpdateMyProfile,
}));

const REQUEST: SaveMyProfileRequest = {
  majorIds: [2],
  profile: {
    bio: '프론트엔드 개발자입니다.',
    isPublic: true,
    links: [{ label: '블로그', url: 'https://blog.example.com' }],
    phone: '010-1234-5678',
  },
  techStackIds: [10, 11],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockReplaceMyMajors.mockResolvedValue(undefined);
  mockReplaceMyTechStacks.mockResolvedValue(undefined);
  mockUpdateMyProfile.mockResolvedValue(undefined);
});

describe('saveMyProfile', () => {
  it('변경한 연관 정보와 프로필을 순서대로 저장한 뒤 최신 프로필을 반환한다', async () => {
    const profile = { memberId: 1, name: '김게티' };
    mockFetchMyProfile.mockResolvedValue(profile);

    await expect(saveMyProfile(REQUEST)).resolves.toBe(profile);

    expect(mockReplaceMyMajors).toHaveBeenCalledWith([2]);
    expect(mockReplaceMyTechStacks).toHaveBeenCalledWith([10, 11]);
    expect(mockUpdateMyProfile).toHaveBeenCalledWith(REQUEST.profile);
    expect(mockFetchMyProfile).toHaveBeenCalledOnce();
    expect(mockReplaceMyMajors.mock.invocationCallOrder[0]).toBeLessThan(
      mockReplaceMyTechStacks.mock.invocationCallOrder[0],
    );
    expect(mockReplaceMyTechStacks.mock.invocationCallOrder[0]).toBeLessThan(
      mockUpdateMyProfile.mock.invocationCallOrder[0],
    );
    expect(mockUpdateMyProfile.mock.invocationCallOrder[0]).toBeLessThan(
      mockFetchMyProfile.mock.invocationCallOrder[0],
    );
  });

  it('변경하지 않은 연관 정보는 교체 요청을 생략한다', async () => {
    mockFetchMyProfile.mockResolvedValue({ memberId: 1 });

    await saveMyProfile({ profile: REQUEST.profile });

    expect(mockReplaceMyMajors).not.toHaveBeenCalled();
    expect(mockReplaceMyTechStacks).not.toHaveBeenCalled();
    expect(mockUpdateMyProfile).toHaveBeenCalledWith(REQUEST.profile);
  });

  it('중간 저장이 실패하면 이후 요청과 프로필 재조회를 실행하지 않는다', async () => {
    mockReplaceMyTechStacks.mockRejectedValueOnce(new Error('failed'));

    await expect(saveMyProfile(REQUEST)).rejects.toThrow('failed');

    expect(mockUpdateMyProfile).not.toHaveBeenCalled();
    expect(mockFetchMyProfile).not.toHaveBeenCalled();
  });
});
