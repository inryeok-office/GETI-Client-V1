import { uploadCommonFile, type CommonFileUploadResponse } from '@/entities/common-file';

export function uploadMyProfileImage(file: File): Promise<CommonFileUploadResponse> {
  return uploadCommonFile(file, 'PROFILE_IMAGE');
}
