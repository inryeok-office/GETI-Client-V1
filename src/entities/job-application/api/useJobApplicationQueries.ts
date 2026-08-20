'use client';

import { useMutation } from '@tanstack/react-query';

import {
  createJobApplicationDraft,
  executeJobApplicationAction,
  saveJobApplicationDraft,
  uploadApplicationFile,
  type ExecuteJobApplicationActionParams,
  type SaveJobApplicationDraftParams,
} from './jobApplicationApi';

export function useCreateJobApplicationDraftMutation() {
  return useMutation({
    mutationFn: (jobId: number) => createJobApplicationDraft(jobId),
  });
}

export function useSaveJobApplicationDraftMutation() {
  return useMutation({
    mutationFn: (params: SaveJobApplicationDraftParams) => saveJobApplicationDraft(params),
  });
}

export function useJobApplicationActionMutation() {
  return useMutation({
    mutationFn: (params: ExecuteJobApplicationActionParams) => executeJobApplicationAction(params),
  });
}

export function useUploadApplicationFileMutation() {
  return useMutation({
    mutationFn: (file: File) => uploadApplicationFile(file),
  });
}
