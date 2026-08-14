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
