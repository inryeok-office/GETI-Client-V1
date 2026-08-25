import { describe, expect, it } from 'vitest';

import { formatNotificationRelativeTime } from './formatNotificationRelativeTime';

const NOW = new Date('2026-08-24T12:00:00');

describe('formatNotificationRelativeTime', () => {
  it.each([
    ['2026-08-24T11:59:40', '방금 전'],
    ['2026-08-24T11:50:00', '10분 전'],
    ['2026-08-24T10:00:00', '2시간 전'],
    ['2026-08-23T12:00:00', '어제'],
    ['2026-08-21T12:00:00', '3일 전'],
    ['2026-08-10T12:00:00', '8월 10일'],
    ['2025-08-10T12:00:00', '2025년 8월 10일'],
  ])('%s를 %s로 표시한다', (value, expected) => {
    expect(formatNotificationRelativeTime(value, NOW)).toBe(expected);
  });

  it('올바르지 않은 날짜는 빈 문자열로 표시한다', () => {
    expect(formatNotificationRelativeTime('invalid', NOW)).toBe('');
  });
});
