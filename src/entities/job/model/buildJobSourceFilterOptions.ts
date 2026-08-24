import type { JobSourceOption } from './types';

export interface JobSourceFilterOption {
  /** "출처" 드롭다운에 보여주고 `selected` 상태 · URL에 저장하는 값. */
  label: string;
  sourceCode: string;
}

/**
 * "출처" 드롭다운 옵션을 만든다. `JobSourceOption.name`은 관리자가 자유 입력하는 표시값이라
 * 유일성이 보장되지 않는다(수집원 관리 화면에서 등록, 특히 `MANUAL` 유형은 여러 행이 같은
 * 이름을 가질 수 있다) — 겹치는 이름을 그대로 라벨로 쓰면 드롭다운에서 어느 쪽을 골라도
 * `Object.fromEntries`가 마지막 항목의 `sourceCode`로 덮어써 조용히 잘못된 값으로 필터링된다.
 * 겹치는 이름에는 `sourceCode`를 붙여 라벨을 유일하게 만든다.
 */
export function buildJobSourceFilterOptions(sources: JobSourceOption[]): JobSourceFilterOption[] {
  const nameCounts = new Map<string, number>();
  for (const source of sources) {
    nameCounts.set(source.name, (nameCounts.get(source.name) ?? 0) + 1);
  }

  return sources.map((source) => ({
    label:
      (nameCounts.get(source.name) ?? 0) > 1
        ? `${source.name} (${source.sourceCode})`
        : source.name,
    sourceCode: source.sourceCode,
  }));
}
