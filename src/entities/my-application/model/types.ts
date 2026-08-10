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
}
