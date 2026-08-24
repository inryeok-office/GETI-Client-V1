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
