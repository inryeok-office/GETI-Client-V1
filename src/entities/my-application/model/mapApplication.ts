import { formatFileSize } from '@/entities/job-application';

import { formatMyApplicationDateTime } from './formatMyApplicationDateTime';
import type {
  ApplicationDetail,
  ApplicationListItem,
  ApplicationStatus,
  ApplicationStatusHistoryEntry,
  MyApplicationApiStatus,
  MyApplicationDetailApiResponse,
  MyApplicationHistoryEntry,
  MyApplicationListApiItem,
} from './types';

/**
 * GETI-Server `JobApplicationStatus`(9종)를 Figma "내 지원" 카드의 배지 4종으로 단순화한다.
 * DRAFT(임시저장 중)는 이 화면 대상이 아니라 null을 돌려주고, 호출부가 걸러낸다.
 */
const STATUS_MAP: Record<MyApplicationApiStatus, ApplicationStatus | null> = {
  DRAFT: null,
  SUBMITTED: 'received',
  EDIT_REQUESTED: 'reviewing',
  EDIT_ALLOWED: 'reviewing',
  REVISION_REQUESTED: 'reviewing',
  FORWARDED: 'reviewing',
  APPROVED: 'resultAnnounced',
  REJECTED: 'resultAnnounced',
  WITHDRAWN: 'cancelled',
};

export function mapMyApplicationStatus(status: MyApplicationApiStatus): ApplicationStatus | null {
  return STATUS_MAP[status];
}

/**
 * 목록 항목 하나를 카드 뷰 모델로 변환한다. DRAFT 항목은 null을 돌려주므로 호출부
 * (`mapMyApplicationListItems`)가 걸러낸다.
 *
 * jobMeta는 Figma 카드에서 "프론트엔드 개발 · 지원일 2026.07.28 14:32"처럼 직무 분야를 앞에
 * 붙이지만, GETI-Server `MyJobApplicationJobSummary`에는 대응하는 필드가 없어(직무명 ·
 * 공고 유형 · 기업 요약만 제공) 지원일만 사용한다.
 */
export function mapMyApplicationListItem(
  item: MyApplicationListApiItem,
): ApplicationListItem | null {
  const status = mapMyApplicationStatus(item.status);
  if (status === null) return null;

  return {
    id: String(item.applicationId),
    companyName: item.job?.company?.name ?? '삭제된 기업',
    jobTitle: item.job?.title ?? '삭제된 공고',
    jobMeta: `지원일 ${formatMyApplicationDateTime(item.submittedAt ?? item.updatedAt)}`,
    status,
  };
}

export function mapMyApplicationListItems(
  items: MyApplicationListApiItem[],
): ApplicationListItem[] {
  return items.reduce<ApplicationListItem[]>((mapped, item) => {
    const listItem = mapMyApplicationListItem(item);
    if (listItem) mapped.push(listItem);
    return mapped;
  }, []);
}

/** 상태 이력 한 건에 실제로 수행된 Action(JobApplicationAction · JobApplicationAdminAction) 라벨. */
const HISTORY_ACTION_LABEL: Record<string, string> = {
  SUBMIT: '지원서 제출',
  REQUEST_EDIT: '수정 권한 요청',
  RESUBMIT: '재제출',
  WITHDRAW: '지원 취소',
  ALLOW_EDIT: '수정 허용',
  REQUEST_REVISION: '보완 요청',
  APPROVE: '합격',
  REJECT: '불합격',
};

export function mapMyApplicationHistory(
  entries: MyApplicationHistoryEntry[],
): ApplicationStatusHistoryEntry[] {
  return entries.map((entry) => ({
    label: HISTORY_ACTION_LABEL[entry.action] ?? entry.action,
    timestamp: formatMyApplicationDateTime(entry.createdAt),
  }));
}

/** JSON 답변 값을 읽기 전용 텍스트로 바꾼다. 문자열은 그대로, 그 외(배열 등)는 JSON 문자열로 보여준다. */
function formatAnswerValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

/**
 * 상세 응답을 화면 뷰 모델로 변환한다.
 *
 * - `questions[].question`은 원래 양식 문항 텍스트가 들어가야 하지만, `GET
 *   /job-applications/{id}` 응답(`ApplicationAnswer`)에는 문항 key(`fieldId`)와 답변 값만
 *   있고 문항 텍스트가 없다. 양식 정의는 `GET /me/forms/{formId}`인데 이 API는 양식을 만든
 *   교사·개발자 본인에게만 열려 있어(403 NOT_FORM_OWNER) 학생이 자기 지원서의 문항 텍스트를
 *   가져올 방법이 현재 없다 — `fieldId`를 그대로 문항 텍스트 자리에 보여준다(추측 금지).
 * - `revisionRequest`는 교사가 보완을 요청한 경우(REVISION_REQUESTED)에만 `statusReason`을
 *   이유로 보여준다. Mock의 `rejectionReason`(이전 반려 사유)에 대응하는 필드가 응답에 없어
 *   항상 비운다.
 */
export function mapMyApplicationDetail(
  detail: MyApplicationDetailApiResponse,
  history: MyApplicationHistoryEntry[],
): ApplicationDetail {
  const status = mapMyApplicationStatus(detail.status) ?? 'received';

  return {
    id: String(detail.applicationId),
    companyName: detail.companyName ?? '삭제된 기업',
    jobTitle: detail.jobTitle ?? '삭제된 공고',
    jobMeta: `지원일 ${formatMyApplicationDateTime(detail.submittedAt ?? detail.updatedAt)}`,
    status,
    statusHistory: mapMyApplicationHistory(history),
    questions: detail.answers.map((answer, index) => ({
      id: answer.fieldId,
      order: `문항 ${index + 1}`,
      question: answer.fieldId,
      answer: formatAnswerValue(answer.value),
    })),
    attachments: detail.files.map((file) => ({
      id: String(file.fileId),
      fileName: file.originalName,
      fileSize: formatFileSize(file.size),
    })),
    revisionRequest:
      detail.status === 'REVISION_REQUESTED' && detail.statusReason
        ? { reason: detail.statusReason }
        : null,
    isJobDeleted: detail.jobTitle === null,
    availableActions: detail.availableActions,
  };
}
