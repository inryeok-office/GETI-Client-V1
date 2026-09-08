import type { JobApplicationMethod } from './types';

/**
 * 지원 방식 → 공고 상세 "지원 유형" 행 표시 문구. 학교 내부 지원서(INTERNAL)인지 외부 채용
 * 페이지(EXTERNAL)인지를 보여준다. 목록 카드의 "학교"/"외부" 배지(`mapJobListItem`)와 문구가
 * 다른 것은 의도된 것이다 — 상세는 행 레이블이 "지원 유형"이라 "지원"을 붙여 읽는다.
 */
export const JOB_APPLICATION_METHOD_LABEL: Record<JobApplicationMethod, string> = {
  INTERNAL: '내부 지원',
  EXTERNAL: '외부 지원',
};
