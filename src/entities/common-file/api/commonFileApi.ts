import { api, type ApiResponse } from '@/shared/api';

import type { CommonFilePurpose, CommonFileUploadResponse } from '../model/types';

export async function uploadCommonFile(
  file: File,
  purpose: CommonFilePurpose,
): Promise<CommonFileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<ApiResponse<CommonFileUploadResponse>>(
    '/api/v1/files',
    formData,
    {
      params: { purpose },
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return data.data;
}
