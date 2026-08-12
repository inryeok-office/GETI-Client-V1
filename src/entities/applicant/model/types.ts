export type ApplicantStatus = 'received' | 'reviewing' | 'approved' | 'rejected';

export interface ApplicantAttachment {
  id: string;
  fileName: string;
  format: string;
  fileSize: string;
}

export interface Applicant {
  id: string;
  name: string;
  /** 학번. 예: "1319" */
  studentId: string;
  /** 예: "10기" */
  cohort: string;
  /** 예: "SW개발과" */
  department: string;
  /** 지원 공고 제목. 예: "프론트엔드 개발자" */
  jobTitle: string;
  company: string;
  /** 담당자. 아직 배정 전이면 null(화면엔 "ㅡ"로 표시). */
  reviewerName: string | null;
  /** 목록 테이블에 쓰는 짧은 표기. 예: "08.01 10:24" */
  submittedAt: string;
  /** 상세 패널에 쓰는 전체 표기. 예: "2026.08.01 10:24" */
  submittedAtDetail: string;
  status: ApplicantStatus;
  contact: string;
  /** 지원 동기 */
  motivation: string;
  attachments: ApplicantAttachment[];
  /** 처리 이력 한 줄 표기. 예: "접수 → 검토 중 · 김선생 · 08.01 14:10" */
  historyLabel: string;
}
