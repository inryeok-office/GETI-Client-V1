import type {
  PortfolioApiRequestStatus,
  PortfolioRequest,
  PortfolioRequestResponse,
  PortfolioRequestSummaryResponse,
  PortfolioSubmission,
  PortfolioSubmissionStatusResponse,
} from './types';

const DEPARTMENT_LABELS: Record<string, string> = {
  AI: '인공지능과',
  SMART_IOT: '스마트IoT과',
  SOFTWARE: '소프트웨어개발과',
  SW_DEVELOPMENT: '소프트웨어개발과',
};

const MATERIAL_TYPE_LABELS = {
  BOTH: '파일 + URL',
  FILE: '파일',
  URL: 'URL',
} as const;

export function mapAdminPortfolioRequest(
  request: PortfolioRequestResponse | PortfolioRequestSummaryResponse,
): PortfolioRequest {
  return {
    requestId: request.requestId,
    title: request.title,
    description: 'description' in request ? request.description : null,
    dueAt: request.dueAt,
    duePeriod: formatDuePeriod(request.dueAt),
    target: `대상 ${request.targetCount}명`,
    submittedCount: request.submittedCount,
    targetCount: request.targetCount,
    status: mapRequestStatus(request.status),
    createdAt: 'createdAt' in request && request.createdAt ? formatDate(request.createdAt) : '—',
  };
}

function mapRequestStatus(status: PortfolioApiRequestStatus): PortfolioRequest['status'] {
  if (status === 'PUBLISHED') return 'OPEN';
  if (status === 'DRAFT') return 'DRAFT';
  return 'CLOSED';
}

export function mapAdminPortfolioSubmission(
  submission: PortfolioSubmissionStatusResponse,
): PortfolioSubmission {
  return {
    submissionId: submission.memberId,
    memberId: submission.memberId,
    studentName: submission.studentName ?? '이름 없음',
    studentNumber: '-',
    cohortAndDepartment: formatStudentMeta(submission.cohort, submission.department),
    status: submission.submitted ? 'SUBMITTED' : 'NOT_SUBMITTED',
    submittedAt: submission.submittedAt ? formatDateTime(submission.submittedAt) : null,
    materialType: submission.materialType ? MATERIAL_TYPE_LABELS[submission.materialType] : null,
  };
}

function formatDuePeriod(date: string) {
  return `${formatDate(date)}까지`;
}

function formatDate(date: string) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function formatDateTime(date: string) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
  return `${month}.${day} ${hours}:${minutes}`;
}

function formatStudentMeta(cohort: number | null, department: string | null) {
  const parts = [
    cohort === null ? null : `${cohort}기`,
    department ? (DEPARTMENT_LABELS[department] ?? department) : null,
  ].filter((value): value is string => value !== null);

  return parts.length > 0 ? parts.join(', ') : '-';
}
