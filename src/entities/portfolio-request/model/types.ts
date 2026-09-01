export type PortfolioApiRequestStatus = 'CLOSED' | 'DELETED' | 'DRAFT' | 'PUBLISHED';
export type PortfolioRequestStatus = 'CLOSED' | 'DRAFT' | 'OPEN';

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

export interface PortfolioRequestSummaryApiResponse {
  dueAt: string;
  requestId: number;
  status: PortfolioApiRequestStatus;
  submittedCount: number;
  targetCount: number;
  title: string;
}

export interface PortfolioRequestListApiResponse {
  content: PortfolioRequestSummaryApiResponse[];
  first: boolean;
  last: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PortfolioRequestDetailApiResponse {
  createdAt: string | null;
  description: string | null;
  dueAt: string;
  requestId: number;
  status: PortfolioApiRequestStatus;
  submittedCount: number;
  targetCount: number;
  title: string;
  updatedAt: string | null;
}

export interface PortfolioSubmissionFileApiResponse {
  contentType: string;
  downloadUrl: string;
  fileId: number;
  originalName: string;
  size: number;
}

export type PortfolioSubmissionUpsertStatus = 'DRAFT' | 'SUBMITTED';

export interface PortfolioSubmissionApiResponse {
  files: PortfolioSubmissionFileApiResponse[];
  note: string | null;
  portfolioUrl: string | null;
  requestId: number;
  status: PortfolioSubmissionUpsertStatus;
  submissionId: number;
  submittedAt: string | null;
  updatedAt: string | null;
}

export interface PortfolioSubmissionUpsertRequest {
  fileIds: number[];
  note?: string | null;
  portfolioUrl?: string | null;
  status: PortfolioSubmissionUpsertStatus;
}

export interface FetchPortfolioRequestListParams {
  page?: number;
  size?: number;
  status?: PortfolioApiRequestStatus;
}

export interface PortfolioRequestListItem {
  dDay: number | null;
  description: string;
  duePeriod: string;
  registeredAt: string;
  requestId: string;
  status: PortfolioRequestSubmissionStatus;
  submittedCount: number;
  targetCount: number;
  title: string;
}

export type PortfolioUploadError = 'DUPLICATE_URL' | 'SIZE_EXCEEDED' | 'UPLOAD_FAILED';

export interface PortfolioUploadFile {
  error: PortfolioUploadError | null;
  fileId: number | null;
  id: string;
  name: string;
  progress: number | null;
  size: string;
}
