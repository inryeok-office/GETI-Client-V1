import type { OperationJobActionStatus } from './types';

export type OperationJobStatusTone = 'error' | 'neutral' | 'success';

export interface OperationJobStatusPresentation {
  label: string;
  tone: OperationJobStatusTone;
}

const STATUS_PRESENTATIONS: Record<string, OperationJobStatusPresentation> = {
  CANCELED: { label: '취소', tone: 'neutral' },
  COMPLETED: { label: '성공', tone: 'success' },
  DEAD: { label: '실패', tone: 'error' },
  DELIVERED: { label: '성공', tone: 'success' },
  FAILED: { label: '실패', tone: 'error' },
  NO_HISTORY: { label: '이력 없음', tone: 'neutral' },
  PARTIAL_SUCCESS: { label: '일부 실패', tone: 'error' },
  PENDING: { label: '대기 중', tone: 'neutral' },
  PROCESSING: { label: '실행 중', tone: 'neutral' },
  RUNNING: { label: '실행 중', tone: 'neutral' },
  SENDING: { label: '전송 중', tone: 'neutral' },
  SENT: { label: '성공', tone: 'success' },
  SUCCESS: { label: '성공', tone: 'success' },
};

const ACTION_STATUS_LABELS: Record<OperationJobActionStatus, string> = {
  SUPPORTED: '지원됨',
  UNSUPPORTED: '미지원',
};

export function getOperationJobStatusPresentation(status: string): OperationJobStatusPresentation {
  return STATUS_PRESENTATIONS[status] ?? { label: status, tone: 'neutral' };
}

export function getOperationJobActionStatusLabel(status: OperationJobActionStatus): string {
  return ACTION_STATUS_LABELS[status];
}

export function formatOperationJobDateTime(value: string | null): string {
  if (!value) return '-';

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;

  const [, year, month, day, hours, minutes] = match;
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}
