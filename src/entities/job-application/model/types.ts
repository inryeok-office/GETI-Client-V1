/**
 * 지원서 작성의 지원자 정보 표시값. `JobApplicationDraftResponse`가 초안 생성 시 학교 등록 정보에서
 * 자동으로 채워 응답하는 값이라 읽기 전용이다 — `phone`만 실제로 수정 가능하다(Issue #123).
 * 학번(studentId)은 `members` 테이블에 컬럼 자체가 없어 서버가 절대 줄 수 없어 뺐다.
 */
export interface ApplicantProfile {
  name: string | null;
  cohort: number | null;
  department: string | null;
  email: string;
  phone: string;
}

/** `FormFieldResponse.type`. FILE은 `QuestionsSection`이 아니라 `AttachmentUploadSection`이 답변을 받는다. */
export type ApplicationQuestionType =
  'TEXT' | 'TEXTAREA' | 'SINGLE_SELECT' | 'MULTI_SELECT' | 'FILE';

/**
 * 지원서 문항 하나(`FormFieldResponse`). 공고마다 개수 · 내용 · 타입이 다르다
 * (GETI-Server-V1 #217/#234로 `JobApplicationDraftResponse.questions`에 노출됨).
 */
export interface ApplicationQuestion {
  fieldId: string;
  type: ApplicationQuestionType;
  title: string;
  description: string | null;
  required: boolean;
  /** 문항 표시 순서. 1부터 시작하는 실제 값이라 화면의 "문항 N" 라벨에 그대로 쓴다. */
  order: number;
  /** SINGLE_SELECT · MULTI_SELECT일 때만 값이 있다. */
  options: string[] | null;
}

/**
 * 첨부파일 업로드 실패 사유. sizeExceeded · invalidFormat · countExceeded는 `app.file.policies.
 * JOB_APPLICATION` 실제 제약(PDF/PNG/JPG, 10MB, 5개)을 클라이언트에서 미리 검사한 결과고,
 * uploadFailed는 그 검사를 통과했는데도 실제 업로드 요청 자체가 실패한 경우다.
 */
export type AttachmentUploadError =
  'sizeExceeded' | 'invalidFormat' | 'countExceeded' | 'uploadFailed';

/** 지원서에 첨부한 파일. */
export interface ApplicationAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  /** 업로드 실패 사유. 정상 첨부는 null. */
  uploadError: AttachmentUploadError | null;
  /** 실제 업로드가 성공해 받은 서버 fileId. 검증 실패로 업로드하지 못했으면 null. */
  fileId: number | null;
}

export type JobApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'EDIT_REQUESTED'
  | 'EDIT_ALLOWED'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'FORWARDED'
  | 'WITHDRAWN';

/**
 * `JobApplicationDraftResponse.answers[]`. `fieldId`는 같은 응답의 `questions[].fieldId`와
 * 매칭된다. `value`는 문항 타입에 따라 모양이 다르다 — TEXT · TEXTAREA · SINGLE_SELECT는
 * 문자열, MULTI_SELECT는 문자열 배열, FILE은 `value` 대신 `fileIds`를 쓴다.
 */
export interface ApplicationAnswer {
  fieldId: string;
  value: unknown;
  fileIds: number[] | null;
}

export interface JobApplicationDraftFile {
  fileId: number;
  originalName: string;
  contentType: string;
  size: number;
  downloadUrl: string;
}

/** `POST /jobs/{jobId}/applications` · `PATCH /job-applications/{id}` · `POST .../actions` 공통 응답. */
export interface JobApplicationDraft {
  applicationId: number;
  jobId: number;
  formId: number | null;
  formVersion: number | null;
  status: JobApplicationStatus;
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
  /** 이 공고 Form Version에 실제로 연결된 문항 구조(GETI-Server-V1 #217/#234). */
  questions: ApplicationQuestion[];
  answers: ApplicationAnswer[];
  files: JobApplicationDraftFile[];
  submittedAt: string | null;
  withdrawnAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type JobApplicationActionType = 'SUBMIT' | 'REQUEST_EDIT' | 'RESUBMIT' | 'WITHDRAW';

/** `POST /files` 응답. */
export interface UploadedApplicationFile {
  fileId: number;
  originalName: string;
  contentType: string;
  size: number;
  purpose: string;
  createdAt: string;
}
