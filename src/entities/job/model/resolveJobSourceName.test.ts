import { describe, expect, it } from 'vitest';

import { resolveJobSourceName } from './resolveJobSourceName';
import type { JobSourceOption } from './types';

const SOURCES: JobSourceOption[] = [
  { sourceId: 1, sourceCode: 'SARAMIN', name: '사람인', active: true },
  { sourceId: 2, sourceCode: 'WORK24', name: '고용24', active: true },
];

describe('resolveJobSourceName', () => {
  it('목록에서 같은 sourceCode를 찾아 표시명으로 바꾼다', () => {
    expect(resolveJobSourceName('SARAMIN', SOURCES)).toBe('사람인');
  });

  it('목록에 없는 코드는 코드 원문을 그대로 돌려준다', () => {
    expect(resolveJobSourceName('UNKNOWN', SOURCES)).toBe('UNKNOWN');
  });

  it('목록이 비어 있으면(로딩·에러) 코드 원문을 그대로 돌려준다', () => {
    expect(resolveJobSourceName('SARAMIN', [])).toBe('SARAMIN');
  });

  it('이름이 겹치는 코드는 "이름 (코드)" 형태의 유일한 라벨을 쓴다', () => {
    const dupSources: JobSourceOption[] = [
      { sourceId: 1, sourceCode: 'MANUAL', name: '기타', active: true },
      { sourceId: 2, sourceCode: 'MMA', name: '기타', active: true },
    ];

    expect(resolveJobSourceName('MMA', dupSources)).toBe('기타 (MMA)');
  });
});
