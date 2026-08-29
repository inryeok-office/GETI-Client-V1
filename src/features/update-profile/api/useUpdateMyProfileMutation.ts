'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadCommonFile } from '@/entities/common-file';
import { memberKeys } from '@/entities/member';

import { saveMyProfile } from './saveMyProfile';

export function useUploadMyProfileImageMutation() {
  return useMutation({ mutationFn: (file: File) => uploadCommonFile(file, 'PROFILE_IMAGE') });
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
