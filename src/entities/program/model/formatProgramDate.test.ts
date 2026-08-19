import { describe, expect, it } from 'vitest';

import { formatProgramDate, formatProgramPeriod } from './formatProgramDate';

describe('formatProgramDate', () => {
  it('ISO 날짜를 점 구분 형식으로 바꾼다', () => {
    expect(formatProgramDate('2026-07-20')).toBe('2026.07.20');
    expect(formatProgramDate('2026-07-20T09:00:00')).toBe('2026.07.20');
  });

  it('형식이 다른 값은 그대로 둔다', () => {
    expect(formatProgramDate('미정')).toBe('미정');
  });

  it('기간을 en dash로 잇는다', () => {
    expect(formatProgramPeriod('2026-07-20', '2026-08-10')).toBe('2026.07.20 – 2026.08.10');
  });
});
