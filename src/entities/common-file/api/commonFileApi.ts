import { api, type ApiResponse } from '@/shared/api';

import type {
  CommonFileListApiResponse,
  CommonFileUploadApiResponse,
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

export async function uploadCommonFile({
  file,
  onProgress,
  purpose,
  signal,
}: UploadCommonFileVariables): Promise<CommonFileUploadApiResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);

  const { data } = await api.post<ApiResponse<CommonFileUploadApiResponse>>(FILES_PATH, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...(signal ? { signal } : {}),
    onUploadProgress: ({ loaded, total }) => {
      if (!total) return;
      onProgress?.(Math.min(100, Math.round((loaded / total) * 100)));
    },
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
