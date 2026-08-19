import type { CompanySize } from './types';

/** 기업 규모 한글 라벨. 목록 카드와 상세 화면이 같이 쓴다. */
export const COMPANY_SIZE_LABEL: Record<CompanySize, string> = {
  large: '대기업',
  midsize: '중견기업',
  small: '중소기업',
};
