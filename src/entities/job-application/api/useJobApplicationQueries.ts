'use client';

import { useMutation } from '@tanstack/react-query';

import {
  createJobApplicationDraft,
  executeJobApplicationAction,
  findActiveJobApplicationDraft,
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

/** 409(이미 활성 지원서 존재) 시 그 공고의 기존 임시저장 지원서를 불러온다. 없으면 null. */
export function useResumeJobApplicationDraftMutation() {
  return useMutation({
    mutationFn: (jobId: number) => findActiveJobApplicationDraft(jobId),
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
