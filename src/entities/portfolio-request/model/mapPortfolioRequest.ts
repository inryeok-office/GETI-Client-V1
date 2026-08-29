import type {
  PortfolioRequestDetailApiResponse,
  PortfolioRequestListItem,
  PortfolioApiRequestStatus,
  PortfolioRequestSubmissionStatus,
  PortfolioRequestSummaryApiResponse,
} from './types';

export function mapPortfolioRequestSummaryToListItem(
  request: PortfolioRequestSummaryApiResponse,
): PortfolioRequestListItem {
  const status = mapRequestStatusToSubmissionStatus(request.status, request.dueAt);

  return {
    dDay: status === 'REQUIRED' ? calculateDDay(request.dueAt) : null,
    description: `${request.submittedCount}/${request.targetCount}명 제출`,
    duePeriod: formatDueAt(request.dueAt),
    registeredAt: '',
    requestId: String(request.requestId),
    status,
    submittedCount: request.submittedCount,
    targetCount: request.targetCount,
    title: request.title,
  };
}

export function mapPortfolioRequestDetailToListItem(
  request: PortfolioRequestDetailApiResponse,
): PortfolioRequestListItem {
  const status = mapRequestStatusToSubmissionStatus(request.status, request.dueAt);

  return {
    dDay: status === 'REQUIRED' ? calculateDDay(request.dueAt) : null,
    description: request.description ?? '',
    duePeriod: formatDueAt(request.dueAt),
    registeredAt: request.createdAt ? formatDueAt(request.createdAt) : '',
    requestId: String(request.requestId),
    status,
    submittedCount: request.submittedCount,
    targetCount: request.targetCount,
    title: request.title,
  };
}

export function mapRequestStatusToSubmissionStatus(
  status: PortfolioApiRequestStatus,
  dueAt?: string,
): PortfolioRequestSubmissionStatus {
  if (status === 'CLOSED') return 'CLOSED';
  if (status === 'PUBLISHED' && dueAt !== undefined && isPastDueAt(dueAt)) return 'CLOSED';
  return 'REQUIRED';
}

export function formatDueAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function calculateDDay(value: string): number | null {
  const dueAt = new Date(value).getTime();
  if (Number.isNaN(dueAt)) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(dueAt);
  dueDate.setHours(0, 0, 0, 0);

  return Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000);
}

function isPastDueAt(value: string): boolean {
  const dueAt = new Date(value).getTime();
  if (Number.isNaN(dueAt)) return false;

  return dueAt < Date.now();
}
