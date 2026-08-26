'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { memberKeys } from '@/entities/member';
import { sessionKeys } from '@/entities/session';

import type { CompleteProfileRequest } from '../model/types';
import { completeProfile, uploadProfileImage } from './completeProfileApi';

export function useUploadProfileImageMutation() {
  return useMutation({ mutationFn: (file: File) => uploadProfileImage(file) });
}

export function useCompleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CompleteProfileRequest) => completeProfile(request),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionKeys.current(), session);
      queryClient.invalidateQueries({ queryKey: memberKeys.profile() });
    },
  });
}
