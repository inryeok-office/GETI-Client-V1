import type { ApplicantStatus } from './types';

/** 지원 상태 한글 라벨. 목록 테이블과 상세 패널이 같이 쓴다. */
export const APPLICANT_STATUS_LABEL: Record<ApplicantStatus, string> = {
  received: '접수',
  reviewing: '검토 중',
  approved: '승인',
  rejected: '거부',
};
