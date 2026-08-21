/** 지원 진행 상태. 목록 카드 · 상세 헤더 배지의 색상을 결정한다. */
export type ApplicationStatus = 'received' | 'reviewing' | 'resultAnnounced' | 'cancelled';

export interface ApplicationListItem {
  id: string;
  companyName: string;
  jobTitle: string;
  jobMeta: string;
  status: ApplicationStatus;
}

export interface ApplicationStatusHistoryEntry {
  label: string;
  timestamp: string;
}

export interface ApplicationQuestionAnswer {
  id: string;
  order: string;
  question: string;
  answer: string;
}

export interface ApplicationAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  downloadUrl: string;
}

/** 기업이 보낸 수정·보완 요청. 이전에 거부된 적이 있으면 거부 사유가 함께 붙는다. */
export interface RevisionRequest {
  reason: string;
  rejectionReason?: string;
}

export interface ApplicationDetail extends ApplicationListItem {
  statusHistory: ApplicationStatusHistoryEntry[];
  questions: ApplicationQuestionAnswer[];
  attachments: ApplicationAttachment[];
  revisionRequest: RevisionRequest | null;
  /** 공고가 삭제 · 비공개 처리됐는지. 이 경우 제출 내용은 계속 조회할 수 있다. */
  isJobDeleted: boolean;
  /** 본인이 현재 상태에서 수행할 수 있는 Action(JobApplicationAction) 목록. 예: ["WITHDRAW"]. */
  availableActions: string[];
}

// 아래는 GETI-Server 원본 응답 계약이다(Issue #184). 위 UI 타입(ApplicationListItem 등)은
// Figma 카드에 맞춘 단순화된 뷰 모델이라 그대로 쓸 수 없어, `model/mapApplication.ts`가 이
// 원본 타입을 UI 타입으로 변환한다.

/** GETI-Server `JobApplicationStatus`와 동일하다(`entities/applicant`의 `ApplicantStatus`와 같은 값). */
export type MyApplicationApiStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'EDIT_REQUESTED'
  | 'EDIT_ALLOWED'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'FORWARDED'
  | 'WITHDRAWN';

/** 목록 항목에 실리는 공고 요약. 공고가 삭제되어 조회할 수 없으면 null. */
export interface MyApplicationJobSummary {
  jobId: number;
  title: string;
  company: { companyId: number; name: string; logoUrl: string | null } | null;
}

export interface MyApplicationListApiItem {
  applicationId: number;
  job: MyApplicationJobSummary | null;
  status: MyApplicationApiStatus;
  submittedAt: string | null;
  updatedAt: string;
}

/** `GET /me/job-applications` 응답. Spring Data Page 규약과 동일하게 page는 0부터 시작한다. */
export interface MyApplicationListApiResponse {
  content: MyApplicationListApiItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface MyApplicationApiAnswer {
  fieldId: string;
  value: unknown;
  fileIds: number[] | null;
}

export interface MyApplicationApiFile {
  fileId: number;
  originalName: string;
  contentType: string;
  size: number;
  downloadUrl: string;
}

/** `GET /job-applications/{id}`(본인 상세) 응답. `entities/applicant`의 `ApplicantDetail`과 같은 DTO를 공유하되, 학생 전용 필드(availableActions)가 더 있다. */
export interface MyApplicationDetailApiResponse {
  applicationId: number;
  jobId: number;
  /** 공고를 조회할 수 없으면(삭제 등) null. */
  jobTitle: string | null;
  companyName: string | null;
  status: MyApplicationApiStatus;
  statusReason: string | null;
  answers: MyApplicationApiAnswer[];
  files: MyApplicationApiFile[];
  submittedAt: string | null;
  updatedAt: string;
  /** 본인이 현재 상태에서 수행할 수 있는 Action(JobApplicationAction) 목록. */
  availableActions: string[];
}

/**
 * GETI-Server `JobApplicationAction`과 동일하다(SUBMIT/REQUEST_EDIT/RESUBMIT/WITHDRAW). 지원
 * 상세 화면은 이 중 WITHDRAW · REQUEST_EDIT만 쓴다(SUBMIT은 지원서 작성 화면, RESUBMIT은 재작성
 * UI가 아직 없어 Issue #129 범위 밖).
 */
export type MyApplicationAction = 'SUBMIT' | 'REQUEST_EDIT' | 'RESUBMIT' | 'WITHDRAW';

/** `GET /job-applications/{id}/history` 항목. `entities/applicant`의 `ApplicantHistoryEntry`와 같은 DTO다. */
export interface MyApplicationHistoryEntry {
  historyId: number;
  fromStatus: MyApplicationApiStatus;
  toStatus: MyApplicationApiStatus;
  action: string;
  actorMemberId: number;
  reason: string | null;
  createdAt: string;
}
