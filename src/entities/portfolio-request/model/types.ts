export type PortfolioRequestStatus = 'DRAFT' | 'OPEN' | 'CLOSED';

export interface PortfolioRequest {
  requestId: number;
  title: string;
  duePeriod: string;
  target: string;
  submittedCount: number;
  targetCount: number;
  status: PortfolioRequestStatus;
  createdAt: string;
}

export type PortfolioSubmissionStatus = 'SUBMITTED' | 'NOT_SUBMITTED';

export interface PortfolioSubmission {
  submissionId: number;
  studentName: string;
  studentNumber: string;
  cohortAndDepartment: string;
  status: PortfolioSubmissionStatus;
  submittedAt: string | null;
  materialType: string | null;
}

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
