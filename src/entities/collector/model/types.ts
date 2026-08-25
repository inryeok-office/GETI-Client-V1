export type CollectorRunStatus = 'FAILED' | 'PARTIAL_SUCCESS' | 'SUCCESS';

export interface CollectorRunError {
  description: string;
  title: string;
}

export interface CollectorRun {
  createdCount: number;
  errorSummary: CollectorRunError[];
  executedAt: string;
  failedCount: number;
  runId: string;
  sourceName: string;
  status: CollectorRunStatus;
  updatedCount: number;
}
