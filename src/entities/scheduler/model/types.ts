export type ScheduledTaskStatus = 'FAILED' | 'SUCCESS';

export type ScheduledTaskActionStatus = 'AVAILABLE' | 'REQUESTED' | 'UNAVAILABLE';

export interface ScheduledTask {
  actionStatus: ScheduledTaskActionStatus;
  description: string;
  lastRunAt: string;
  name: string;
  nextRunAt: string;
  schedule: string;
  status: ScheduledTaskStatus;
  taskId: string;
}

/**
 * `GET /api/v1/admin/system/jobs`(GETI-Server-V1 #239) 응답 항목. DEVELOPER 전용, 실제 등록된
 * 정기 작업 6종 고정. 위 `ScheduledTask`(정기 작업 관리 화면 Mock 모델)와 겹치는 부분이 있는데,
 * 그 화면을 실 API에 연동할 때 하나로 합치는 걸 검토한다 — 지금은 대시보드가 쓰는 실 응답만 담는다.
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
