import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { memberKeys, type MyProfile } from '@/entities/member';

import type { SaveMyProfileRequest } from '../model/types';
import {
  useUpdateMyProfileMutation,
  useUploadMyProfileImageMutation,
} from './useUpdateMyProfileMutation';

const { mockSaveMyProfile, mockUploadMyProfileImage } = vi.hoisted(() => ({
  mockSaveMyProfile: vi.fn(),
  mockUploadMyProfileImage: vi.fn(),
}));

vi.mock('./saveMyProfile', () => ({ saveMyProfile: mockSaveMyProfile }));
vi.mock('./uploadMyProfileImage', () => ({ uploadMyProfileImage: mockUploadMyProfileImage }));

const REQUEST: SaveMyProfileRequest = {
  profile: { bio: '수정된 소개', isPublic: false, links: [], phone: null },
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useUpdateMyProfileMutation', () => {
  it('프로필 이미지 업로드 Mutation에 선택한 파일을 전달한다', async () => {
    const queryClient = new QueryClient();
    const file = new File(['image'], 'profile.png', { type: 'image/png' });
    mockUploadMyProfileImage.mockResolvedValue({ fileId: 77 });
    const { result } = renderHook(() => useUploadMyProfileImageMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(file);
    });

    expect(mockUploadMyProfileImage).toHaveBeenCalledWith(file, expect.anything());
  });

  it('저장 성공 시 재조회한 최신 프로필로 캐시를 교체한다', async () => {
    const queryClient = new QueryClient();
    const profile = { memberId: 1, name: '김게티' } as MyProfile;
    mockSaveMyProfile.mockResolvedValue(profile);
    const { result } = renderHook(() => useUpdateMyProfileMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(REQUEST);
    });

    expect(mockSaveMyProfile).toHaveBeenCalledWith(REQUEST, expect.anything());
    expect(queryClient.getQueryData(memberKeys.profile())).toBe(profile);
  });

  it('저장 실패 시 일부 반영됐을 수 있는 프로필 캐시를 무효화한다', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockSaveMyProfile.mockRejectedValue(new Error('failed'));
    const { result } = renderHook(() => useUpdateMyProfileMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync(REQUEST);
      }),
    ).rejects.toThrow('failed');

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: memberKeys.profile() });
  });
});
