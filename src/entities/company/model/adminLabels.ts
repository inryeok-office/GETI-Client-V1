import type { AdminCompanyType, MouStatus } from './types';

/** 어드민 기업 관리 목록의 기업 유형 한글 라벨. */
export const ADMIN_COMPANY_TYPE_LABEL: Record<AdminCompanyType, string> = {
  large: '대기업',
  midsize: '중견기업',
  small: '중소기업',
  startup: '스타트업',
};

/** MOU 체결 상태 한글 라벨. */
export const MOU_STATUS_LABEL: Record<MouStatus, string> = {
  signed: '체결',
  unsigned: '미체결',
  expired: '만료',
};
