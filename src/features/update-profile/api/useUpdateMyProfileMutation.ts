'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { memberKeys } from '@/entities/member';

import { saveMyProfile } from './saveMyProfile';
import { uploadMyProfileImage } from './uploadMyProfileImage';

export function useUploadMyProfileImageMutation() {
  return useMutation({ mutationFn: uploadMyProfileImage });
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveMyProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(memberKeys.profile(), profile);
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: memberKeys.profile() });
    },
  });
}
