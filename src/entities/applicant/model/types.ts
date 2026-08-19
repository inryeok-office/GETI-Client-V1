/** 지원서 상태. GETI-Server `JobApplicationAdminListItemResponse`/`JobApplicationDraftResponse`의 status와 동일하다. */
export type ApplicantStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'EDIT_REQUESTED'
  | 'EDIT_ALLOWED'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'FORWARDED'
  | 'WITHDRAWN';

/** 교사 검토 Action. 목록 API는 이 4종만 허용한다(제출·철회 등 학생 Action은 별도). */
export type ApplicantReviewAction = 'ALLOW_EDIT' | 'REQUEST_REVISION' | 'APPROVE' | 'REJECT';

/** `GET /admin/job-applications` 목록 항목. */
export interface ApplicantListItem {
  applicationId: number;
  jobId: number;
  applicantMemberId: number;
  applicantName: string | null;
  applicantCohort: number | null;
  applicantDepartment: string | null;
  /** 공고 제목. PR #179(GETI-Server)에서 목록·상세 응답에 추가됐다. */
  jobTitle: string | null;
  companyName: string | null;
  /** 담당 교사 memberId. 지정된 담당자가 없는 공고는 null. */
  managerMemberId: number | null;
  managerName: string | null;
  status: ApplicantStatus;
  submittedAt: string | null;
  createdAt: string;
}

export interface ApplicantListResponse {
  content: ApplicantListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApplicantAnswer {
  fieldId: string;
  value: unknown;
  fileIds: number[] | null;
}

export interface ApplicantFile {
  fileId: number;
  originalName: string;
  contentType: string;
  size: number;
  downloadUrl: string;
}

/** `GET /admin/job-applications/{id}` 상세, Action 응답도 동일한 모양이다. */
export interface ApplicantDetail {
  applicationId: number;
  jobId: number;
  jobTitle: string | null;
  companyName: string | null;
  managerMemberId: number | null;
  managerName: string | null;
  formId: number | null;
  formVersion: number | null;
  status: ApplicantStatus;
  statusReason: string | null;
  contactEmail: string;
  contactPhone: string | null;
  privacyConsent: boolean;
  applicantName: string | null;
  applicantCohort: number | null;
  applicantDepartment: string | null;
  applicantMajors: string[];
  applicantDesiredJob: string | null;
  applicantTechStacks: string[];
  answers: ApplicantAnswer[];
  files: ApplicantFile[];
  submittedAt: string | null;
  withdrawnAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** `GET /admin/job-applications/{id}/history` 항목. */
export interface ApplicantHistoryEntry {
  historyId: number;
  fromStatus: ApplicantStatus;
  toStatus: ApplicantStatus;
  action: string;
  actorMemberId: number;
  reason: string | null;
  createdAt: string;
}
