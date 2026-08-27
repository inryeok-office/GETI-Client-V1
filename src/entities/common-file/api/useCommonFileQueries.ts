'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import type { FetchCommonFileListParams, UploadCommonFileVariables } from '../model/types';
import { downloadCommonFile, fetchAdminCommonFileList, uploadCommonFile } from './commonFileApi';

export const commonFileKeys = {
  all: ['common-files'] as const,
  lists: () => [...commonFileKeys.all, 'list'] as const,
  list: (params: FetchCommonFileListParams) => [...commonFileKeys.lists(), params] as const,
};

export function useAdminCommonFileListQuery(params: FetchCommonFileListParams = {}) {
  return useQuery({
    queryKey: commonFileKeys.list(params),
    queryFn: () => fetchAdminCommonFileList(params),
    placeholderData: keepPreviousData,
  });
}

export function useUploadCommonFileMutation() {
  return useMutation({
    mutationFn: (variables: UploadCommonFileVariables) => uploadCommonFile(variables),
  });
}

export function useDownloadCommonFileMutation() {
  return useMutation({ mutationFn: (fileId: number) => downloadCommonFile(fileId) });
}
