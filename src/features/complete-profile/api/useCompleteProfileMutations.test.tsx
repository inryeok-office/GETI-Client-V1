import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { memberKeys } from '@/entities/member';
import { sessionKeys } from '@/entities/session';

import type { CompleteProfileRequest } from '../model/types';
import {
  useCompleteProfileMutation,
  useUploadProfileImageMutation,
} from './useCompleteProfileMutations';

const { mockCompleteProfile, mockUploadProfileImage } = vi.hoisted(() => ({
  mockCompleteProfile: vi.fn(),
  mockUploadProfileImage: vi.fn(),
}));

vi.mock('./completeProfileApi', () => ({
  completeProfile: mockCompleteProfile,
  uploadProfileImage: mockUploadProfileImage,
}));

const REQUEST: CompleteProfileRequest = {
  cohort: 10,
  department: 'AI',
  desiredJob: 'AI 엔지니어',
  majorIds: [3],
  phone: null,
  profileImageFileId: 77,
  techStackIds: [12],
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('complete profile mutations', () => {
  it('이미지 업로드 Mutation이 선택한 파일을 전달한다', async () => {
    const queryClient = new QueryClient();
    const file = new File(['image'], 'profile.png', { type: 'image/png' });
    mockUploadProfileImage.mockResolvedValue({ fileId: 77 });
    const { result } = renderHook(() => useUploadProfileImageMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(file);
    });

    expect(mockUploadProfileImage).toHaveBeenCalledWith(file);
  });

  it('완료 Mutation 성공 시 세션 캐시를 교체하고 내 프로필을 무효화한다', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const session = { memberId: 1, roles: ['STUDENT'] };
    mockCompleteProfile.mockResolvedValue(session);
    const { result } = renderHook(() => useCompleteProfileMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(REQUEST);
    });

    expect(mockCompleteProfile).toHaveBeenCalledWith(REQUEST);
    expect(queryClient.getQueryData(sessionKeys.current())).toEqual(session);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: memberKeys.profile() });
  });
});
