/**
 * 지원 진행 상태. 목록 카드 · 상세 헤더의 배지 색상을 함께 결정한다.
 * "지원서 제출"은 배지로 뜨지 않고 상태 이력의 첫 항목으로만 나타나므로 여기 포함하지 않는다.
 */
export type ApplicationStatus = 'received' | 'reviewing' | 'resultAnnounced' | 'cancelled';

/** 내 지원 목록의 카드 한 건. */
export interface ApplicationListItem {
  id: string;
  companyName: string;
  jobTitle: string;
  /** "프론트엔드 개발 · 지원일 2026.07.28 14:32"처럼 직무와 지원일시를 합친 한 줄. */
  jobMeta: string;
  status: ApplicationStatus;
}

/** 상태 이력의 항목 하나(예: "지원서 제출", "접수 완료"). */
export interface ApplicationStatusHistoryEntry {
  label: string;
  timestamp: string;
}

/** 지원서에 제출한 문항과 답변. */
export interface ApplicationQuestionAnswer {
  id: string;
  order: string;
  question: string;
  answer: string;
}

/** 지원서에 첨부한 파일(이미 제출 완료된 상태라 업로드 오류 종류는 없다). */
export interface ApplicationAttachment {
  id: string;
  fileName: string;
  fileSize: string;
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
  /** 지원한 공고가 이후 삭제 · 비공개 처리됐는지. 이 경우 제출 내용은 계속 조회할 수 있다. */
  isJobDeleted: boolean;
}
