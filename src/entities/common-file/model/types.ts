export type CommonFilePurpose =
  | 'COMPANY_LOGO'
  | 'INQUIRY_ANSWER_ATTACHMENT'
  | 'INQUIRY_ATTACHMENT'
  | 'JOB_APPLICATION'
  | 'JOB_ATTACHMENT'
  | 'PORTFOLIO'
  | 'PROFILE_IMAGE'
  | 'PROGRAM_APPLICATION'
  | 'PROGRAM_ATTACHMENT';

export type CommonFileStatus = 'DELETED' | 'FAILED' | 'LINKED' | 'PENDING' | 'UPLOADED';

export type CommonFileOwnerType =
  | 'COMPANY'
  | 'INQUIRY'
  | 'INQUIRY_ANSWER'
  | 'JOB'
  | 'JOB_APPLICATION'
  | 'MEMBER'
  | 'PORTFOLIO_SUBMISSION'
  | 'PROGRAM'
  | 'PROGRAM_APPLICATION';

export interface CommonFileApiUploader {
  memberId: number;
  name: string | null;
}

export interface CommonFileApiItem {
  contentType: string;
  createdAt: string;
  fileId: number;
  originalName: string;
  ownerId: number | null;
  ownerType: CommonFileOwnerType | null;
  purpose: CommonFilePurpose;
  sizeBytes: number;
  status: CommonFileStatus;
  uploader: CommonFileApiUploader | null;
}

export interface CommonFileListApiResponse {
  content: CommonFileApiItem[];
  first: boolean;
  last: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CommonFileUploadResponse {
  contentType: string;
  createdAt: string;
  fileId: number;
  originalName: string;
  purpose: CommonFilePurpose;
  size: number;
}

export type CommonFileUploadApiResponse = CommonFileUploadResponse;

export interface FetchCommonFileListParams {
  originalName?: string;
  page?: number;
  purpose?: CommonFilePurpose;
  size?: number;
  status?: CommonFileStatus;
}

export interface UploadCommonFileVariables {
  file: File;
  onProgress?: (progress: number) => void;
  purpose: CommonFilePurpose;
  signal?: AbortSignal;
}

export interface CommonFileItem {
  fileId: number;
  isDownloadAvailable: boolean;
  name: string;
  purpose: CommonFilePurpose;
  size: string;
  status: CommonFileStatus;
  uploader: string;
  uploadedAt: string;
  usage: string;
}

export interface CommonFileUploadPolicy {
  acceptedExtensions: readonly string[];
  maxFileCount: number;
  maxFileSizeBytes: number;
}

/** 기존 프로필 업로드 UI가 사용하는 진행 표시 모델. */
export interface CommonFileUpload {
  name: string;
  progress: number;
}
