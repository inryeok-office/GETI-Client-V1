import { buildJobSourceFilterOptions } from './buildJobSourceFilterOptions';
import type { JobSourceOption } from './types';

/**
 * 공고 상세의 `sourceName`(안정 코드, 예: `"SARAMIN"`)을 사람이 읽는 출처 이름으로 바꾼다.
 * `GET /api/v1/job-sources` 목록에서 같은 `sourceCode`를 찾아 표시명을 쓰고, 목록에 없거나
 * 아직 로딩 전이면(빈 배열) 코드 원문을 그대로 돌려준다 — 목록 "출처" 필터의 `toOptionLabel`과
 * 같은 fallback 규칙이다(`JobFilterBar`). 이름이 겹치는 코드는 `buildJobSourceFilterOptions`가
 * `이름 (코드)` 형태로 유일하게 만든 라벨을 그대로 쓴다.
 */
export function resolveJobSourceName(sourceCode: string, sources: JobSourceOption[]): string {
  const match = buildJobSourceFilterOptions(sources).find(
    (option) => option.sourceCode === sourceCode,
  );
  return match?.label ?? sourceCode;
}
