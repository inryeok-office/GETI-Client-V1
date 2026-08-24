import { describe, expect, it } from 'vitest';

import { buildJobSourceFilterOptions } from './buildJobSourceFilterOptions';

describe('buildJobSourceFilterOptions', () => {
  it('이름이 유일하면 그대로 라벨로 쓴다', () => {
    const options = buildJobSourceFilterOptions([
      { sourceId: 1, sourceCode: 'SARAMIN', name: '사람인', active: true },
      { sourceId: 2, sourceCode: 'WORK24', name: '고용24', active: true },
    ]);

    expect(options).toEqual([
      { label: '사람인', sourceCode: 'SARAMIN' },
      { label: '고용24', sourceCode: 'WORK24' },
    ]);
  });

  it('이름이 겹치면 sourceCode를 붙여 라벨을 구분한다(MANUAL 유형처럼 표시명이 관리자 자유 입력일 때)', () => {
    const options = buildJobSourceFilterOptions([
      { sourceId: 1, sourceCode: 'MANUAL', name: '기타', active: true },
      { sourceId: 2, sourceCode: 'MMA', name: '기타', active: true },
    ]);

    expect(options).toEqual([
      { label: '기타 (MANUAL)', sourceCode: 'MANUAL' },
      { label: '기타 (MMA)', sourceCode: 'MMA' },
    ]);
    expect(new Set(options.map((option) => option.label)).size).toBe(2);
  });
});
