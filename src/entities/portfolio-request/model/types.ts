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
