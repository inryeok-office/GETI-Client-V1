/** 지원서 작성의 지원자 정보 입력값. */
export interface ApplicantProfile {
  name: string;
  studentId: string;
  cohort: string;
  department: string;
  email: string;
  phone: string;
}

export type ApplicantProfileField = keyof ApplicantProfile;

/** 지원서 문항 하나. 공고마다 개수 · 내용이 다르다. */
export interface ApplicationQuestion {
  id: string;
  /** "문항 1" 같은 순번 라벨. */
  order: string;
  question: string;
}

/** 첨부파일 업로드 실패 사유. */
export type AttachmentUploadError = 'sizeExceeded' | 'invalidFormat' | 'countExceeded';

/** 지원서에 첨부한 파일. */
export interface ApplicationAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  /** 업로드 실패 사유. 정상 첨부는 null. */
  uploadError: AttachmentUploadError | null;
}
