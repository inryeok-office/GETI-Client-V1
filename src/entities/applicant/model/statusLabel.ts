import type { ApplicantStatus } from './types';

/** 지원 상태 한글 라벨. 목록 테이블과 상세 패널이 같이 쓴다. */
export const APPLICANT_STATUS_LABEL: Record<ApplicantStatus, string> = {
  DRAFT: '임시저장',
  SUBMITTED: '제출',
  EDIT_REQUESTED: '수정 요청',
  EDIT_ALLOWED: '수정 허용',
  REVISION_REQUESTED: '보완 요청',
  APPROVED: '승인',
  REJECTED: '거절',
  FORWARDED: '기업 전달',
  WITHDRAWN: '철회',
};

/**
 * 학과 라벨. `applicantDepartment`가 회원 프로필의 department enum(SW_DEVELOPMENT/SMART_IOT/AI)과
 * 같은 값으로 내려올 수도, 이미 포맷된 문자열일 수도 있어 매핑에 없으면 원본 값을 그대로 쓴다.
 */
const DEPARTMENT_LABEL: Record<string, string> = {
  SW_DEVELOPMENT: '소프트웨어개발과',
  SMART_IOT: '스마트IoT과',
  AI: 'AI과',
};

export function formatApplicantDepartment(department: string | null): string {
  if (!department) return 'ㅡ';
  return DEPARTMENT_LABEL[department] ?? department;
}
