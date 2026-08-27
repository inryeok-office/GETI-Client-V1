import type { CommonFilePurpose, CommonFileUploadPolicy } from './types';

const MEBIBYTE = 1024 * 1024;

export const COMMON_FILE_UPLOAD_POLICIES: Record<CommonFilePurpose, CommonFileUploadPolicy> = {
  COMPANY_LOGO: {
    acceptedExtensions: ['png', 'jpg', 'jpeg', 'webp'],
    maxFileCount: 1,
    maxFileSizeBytes: 2 * MEBIBYTE,
  },
  INQUIRY_ANSWER_ATTACHMENT: {
    acceptedExtensions: ['png', 'jpg', 'jpeg', 'pdf'],
    maxFileCount: 3,
    maxFileSizeBytes: 5 * MEBIBYTE,
  },
  INQUIRY_ATTACHMENT: {
    acceptedExtensions: ['png', 'jpg', 'jpeg', 'pdf'],
    maxFileCount: 3,
    maxFileSizeBytes: 5 * MEBIBYTE,
  },
  JOB_APPLICATION: {
    acceptedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
    maxFileCount: 5,
    maxFileSizeBytes: 10 * MEBIBYTE,
  },
  JOB_ATTACHMENT: {
    acceptedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
    maxFileCount: 5,
    maxFileSizeBytes: 10 * MEBIBYTE,
  },
  PORTFOLIO: {
    acceptedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
    maxFileCount: 5,
    maxFileSizeBytes: 20 * MEBIBYTE,
  },
  PROFILE_IMAGE: {
    acceptedExtensions: ['png', 'jpg', 'jpeg', 'webp'],
    maxFileCount: 1,
    maxFileSizeBytes: 5 * MEBIBYTE,
  },
  PROGRAM_APPLICATION: {
    acceptedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
    maxFileCount: 5,
    maxFileSizeBytes: 10 * MEBIBYTE,
  },
  PROGRAM_ATTACHMENT: {
    acceptedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
    maxFileCount: 5,
    maxFileSizeBytes: 10 * MEBIBYTE,
  },
};
