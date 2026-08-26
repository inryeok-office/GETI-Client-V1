export interface CommonFileItem {
  fileId: number;
  name: string;
  size: string;
  uploader: string;
  uploadedAt: string;
  usage: string;
}

export interface CommonFileUpload {
  name: string;
  progress: number;
}

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

export interface CommonFileUploadResponse {
  fileId: number;
  originalName: string;
  contentType: string;
  size: number;
  purpose: CommonFilePurpose;
  createdAt: string;
}
