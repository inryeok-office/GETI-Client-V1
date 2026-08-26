import type { AdminCompanyJobStatus, AdminCompanyType, MouStatus } from './types';

/**
 * 어드민 기업 관리 목록의 기업 유형 한글 라벨.
 * GETI-Server Swagger·Notion 명세서 어디에도 공식 한글 라벨이 정의돼 있지 않아 임의로 정했다
 * (Issue #121에서 사용자 확인 완료). 공식 라벨이 정해지면 이 표만 고치면 된다.
 */
export const ADMIN_COMPANY_TYPE_LABEL: Record<AdminCompanyType, string> = {
  GENERAL: '일반기업',
  PUBLIC_ENTERPRISE: '공기업',
  PUBLIC_INSTITUTION: '공공기관',
  FOREIGN: '외국계기업',
  ETC: '기타',
};

/** MOU 협약 상태 한글 라벨. 위와 같은 이유로 임의로 정했다. */
export const MOU_STATUS_LABEL: Record<MouStatus, string> = {
  NONE: '미체결',
  ACTIVE: '체결',
  EXPIRED: '만료',
  TERMINATED: '해지',
};

/** 어드민 기업 상세의 연결된 공고 상태 한글 라벨. */
export const ADMIN_COMPANY_JOB_STATUS_LABEL: Record<AdminCompanyJobStatus, string> = {
  open: '모집 중',
  reviewing: '검토중',
  closed: '마감',
};

/**
 * 어드민 기업 상세 "연결된 공고"의 공고 유형 한글 라벨. GETI-Server `PostingType`과 동일한
 * 값을 쓴다. 공식 한글 라벨이 정의돼 있지 않아 임의로 정했다(Issue #167).
 */
export const ADMIN_COMPANY_JOB_TYPE_LABEL: Record<string, string> = {
  GENERAL: '일반 공고',
  MOU: 'MOU 공고',
  SCHOOL: '학교 공고',
};

/**
 * 어드민 기업 상세 "최근 변경"의 감사 로그 액션 한글 라벨. GETI-Server 감사 로그는 필드 단위가
 * 아니라 `COMPANY_CREATED`/`COMPANY_UPDATED`/`COMPANY_DELETED` 3개 액션 코드만 준다(Issue #167).
 */
export const ADMIN_COMPANY_AUDIT_ACTION_LABEL: Record<string, string> = {
  COMPANY_CREATED: '기업 등록',
  COMPANY_UPDATED: '기업 정보 수정',
  COMPANY_DELETED: '기업 삭제',
};
