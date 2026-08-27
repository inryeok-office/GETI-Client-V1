import { api, type ApiResponse } from '@/shared/api';

import type {
  CommonFileListApiResponse,
  CommonFilePurpose,
  CommonFileUploadResponse,
  FetchCommonFileListParams,
  UploadCommonFileVariables,
} from '../model/types';

const ADMIN_FILES_PATH = '/api/v1/admin/files';
const FILES_PATH = '/api/v1/files';

export async function fetchAdminCommonFileList(
  params: FetchCommonFileListParams = {},
): Promise<CommonFileListApiResponse> {
  const { data } = await api.get<ApiResponse<CommonFileListApiResponse>>(ADMIN_FILES_PATH, {
    params: { page: 0, size: 20, ...params },
  });
  return data.data;
}

export function uploadCommonFile(
  file: File,
  purpose: CommonFilePurpose,
): Promise<CommonFileUploadResponse>;
export function uploadCommonFile(
  variables: UploadCommonFileVariables,
): Promise<CommonFileUploadResponse>;
export async function uploadCommonFile(
  fileOrVariables: File | UploadCommonFileVariables,
  directPurpose?: CommonFilePurpose,
): Promise<CommonFileUploadResponse> {
  const variables = isUploadVariables(fileOrVariables)
    ? fileOrVariables
    : { file: fileOrVariables, purpose: directPurpose as CommonFilePurpose };
  const { file, onProgress, purpose, signal } = variables;
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<ApiResponse<CommonFileUploadResponse>>(FILES_PATH, formData, {
    params: { purpose },
    headers: { 'Content-Type': 'multipart/form-data' },
    ...(signal ? { signal } : {}),
    ...(onProgress
      ? {
          onUploadProgress: ({ loaded, total }: { loaded: number; total?: number }) => {
            if (!total) return;
            onProgress(Math.min(100, Math.round((loaded / total) * 100)));
          },
        }
      : {}),
  });
  onProgress?.(100);
  return data.data;
}

export async function downloadCommonFile(fileId: number): Promise<Blob> {
  const response = await api.get<Blob>(`${FILES_PATH}/${fileId}/download`, {
    responseType: 'blob',
  });
  return response.data;
}

function isUploadVariables(
  value: File | UploadCommonFileVariables,
): value is UploadCommonFileVariables {
  return 'file' in value;
}
