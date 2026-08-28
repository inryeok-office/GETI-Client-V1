import { COMMON_FILE_UPLOAD_POLICIES } from '@/entities/common-file';

const PROFILE_IMAGE_POLICY = COMMON_FILE_UPLOAD_POLICIES.PROFILE_IMAGE;
const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export const PROFILE_IMAGE_ACCEPT = PROFILE_IMAGE_POLICY.acceptedExtensions
  .map((extension) => `.${extension}`)
  .join(',');

export function getProfileImageValidationError(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLocaleLowerCase('en-US') ?? '';
  const expectedContentType = CONTENT_TYPE_BY_EXTENSION[extension];
  const isAllowedExtension = PROFILE_IMAGE_POLICY.acceptedExtensions.includes(extension);

  if (!isAllowedExtension || !expectedContentType || file.type !== expectedContentType) {
    return '지원하지 않는 이미지입니다. JPG, JPEG, PNG, WEBP 파일만 사용할 수 있습니다.';
  }

  if (file.size > PROFILE_IMAGE_POLICY.maxFileSizeBytes) {
    return '프로필 이미지는 5MB 이하만 사용할 수 있습니다.';
  }

  return null;
}
