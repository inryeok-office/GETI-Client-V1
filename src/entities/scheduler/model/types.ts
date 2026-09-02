/**
 * `GET /api/v1/admin/system/jobs`(GETI-Server-V1 #239) 응답 항목. DEVELOPER 전용이며
 * 실제 등록된 정기 작업 6종을 안정적인 업무 식별자로 노출한다.
 */
export type OperationJobType =
  | 'JOB_COLLECTION'
  | 'JOB_NOTIFICATION_RETRY'
  | 'DISCORD_DELIVERY_RETRY'
  | 'PROGRAM_CLOSE'
  | 'RECOMMENDATION_GENERATION'
  | 'SEARCH_INDEX_RETRY';

/** 수동 실행(Action) 지원 여부. UNSUPPORTED면 실행 API가 없다. */
export type OperationJobActionStatus = 'SUPPORTED' | 'UNSUPPORTED';

export interface OperationJob {
  taskId: OperationJobType;
  jobType: OperationJobType;
  name: string;
  description: string;
  schedule: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
  operationId: string | null;
  /** 마지막 실행의 원본 도메인 상태 문자열(예: `FAILED` · `SUCCESS` · `NO_HISTORY`). enum이 아니다. */
  status: string;
  processedCount: number;
  successCount: number;
  failureCount: number;
  partialSuccessCount: number;
  startedAt: string | null;
  finishedAt: string | null;
  lastError: string | null;
  actionStatus: OperationJobActionStatus;
}

export interface OperationJobListResponse {
  content: OperationJob[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
