export type CollectorAction = 'COLLECT' | 'SYNC';

export type JobSourceApprovalStatus = 'PENDING_APPROVAL' | 'READY' | 'UNAVAILABLE';

export type JobSourceCode =
  'CLEAN_EYE' | 'IBK_ONE_JOB' | 'JOB_ALIO' | 'MANUAL' | 'MMA' | 'NARA_ILTEO' | 'SARAMIN' | 'WORK24';

export type JobSourceType = 'EXTERNAL_API' | 'MANUAL';

export type CollectorRunStatus =
  'CANCELED' | 'FAILED' | 'PARTIAL_SUCCESS' | 'PENDING' | 'RUNNING' | 'SUCCESS';

export interface CollectorRunApiSummary {
  action: CollectorAction;
  createdCount: number | null;
  failedCount: number;
  failureCount: number;
  finishedAt: string | null;
  partialQualityCount: number;
  runId: number;
  sourceId: number;
  sourceName: string;
  startedAt: string;
  status: CollectorRunStatus;
  successCount: number;
  updatedCount: number | null;
}

export interface CollectorRunApiError {
  code: string;
  externalJobId: string | null;
  message: string;
  missingFields: string[];
  occurredAt: string;
}

export interface CollectorRunApiDetail extends CollectorRunApiSummary {
  errors: CollectorRunApiError[];
  totalCount: number;
}

export interface CollectorRunListApiResponse {
  content: CollectorRunApiSummary[];
  first: boolean;
  last: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FetchCollectorRunListParams {
  endAt?: string;
  page?: number;
  size?: number;
  sourceId?: number;
  startAt?: string;
  status?: CollectorRunStatus;
}

export interface JobSourceApiItem {
  approvalStatus: JobSourceApprovalStatus;
  configured: boolean;
  dailyRequestLimit: number | null;
  enabled: boolean;
  lastCollectedAt: string | null;
  lastError: string | null;
  lastFailureAt: string | null;
  lastSuccessAt: string | null;
  name: string;
  sourceCode: JobSourceCode;
  sourceId: number;
  sourceType: JobSourceType;
}

export interface JobSourceListApiResponse {
  sources: JobSourceApiItem[];
}

export interface UpdateJobSourceParams {
  enabled: boolean;
  sourceId: number;
}

export interface JobSourceUpdateApiResponse {
  approvalStatus: JobSourceApprovalStatus;
  configured: boolean;
  enabled: boolean;
  sourceCode: JobSourceCode;
  sourceId: number;
  updatedAt: string | null;
}

export interface ExecuteCollectorActionParams {
  action: CollectorAction;
  sourceIds: number[];
}

export interface CollectorActionApiResponse {
  acceptedAt: string;
  runIds: number[];
  status: CollectorRunStatus;
}

export interface CollectorRunSummary {
  createdCount: number | null;
  executedAt: string;
  failedCount: number;
  hasErrors: boolean;
  runId: number;
  sourceName: string;
  status: CollectorRunStatus;
  updatedCount: number | null;
}

export interface CollectorRunError {
  description: string;
  title: string;
}

export interface CollectorRunDetail extends CollectorRunSummary {
  errorSummary: CollectorRunError[];
}
