export type PortfolioRequestSubmissionStatus = 'CLOSED' | 'REQUIRED' | 'SUBMITTED';

export interface PortfolioRequestListItem {
  dDay: number | null;
  description: string;
  duePeriod: string;
  registeredAt: string;
  requestId: string;
  status: PortfolioRequestSubmissionStatus;
  title: string;
}

export type PortfolioUploadError = 'DUPLICATE_URL' | 'SIZE_EXCEEDED' | 'UPLOAD_FAILED';

export interface PortfolioUploadFile {
  error: PortfolioUploadError | null;
  fileId: string;
  name: string;
  progress: number | null;
  size: string;
}
