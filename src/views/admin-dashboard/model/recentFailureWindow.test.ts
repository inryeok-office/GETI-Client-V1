import { describe, expect, it } from 'vitest';

import { recentFailureSince } from './recentFailureWindow';

describe('recentFailureSince', () => {
  it('현재 기준 24시간 전을 KST 벽시계 시각으로, 시 경계로 내림해 반환한다', () => {
    // 2026-08-27 05:37:41 UTC → KST 14:37:41. 24h 전 = 2026-08-26 05:37 UTC → 시 내림 05:00
    // → KST 14:00:00
    const now = Date.UTC(2026, 7, 27, 5, 37, 41);

    expect(recentFailureSince(now)).toBe('2026-08-26T14:00:00');
  });

  it('자정 직후에는 전날 날짜로 롤오버한다', () => {
    // 2026-08-27 00:20 UTC → KST 09:20. 24h 전 = 2026-08-26 00:20 UTC → 09:00 KST
    const now = Date.UTC(2026, 7, 27, 0, 20, 0);

    expect(recentFailureSince(now)).toBe('2026-08-26T09:00:00');
  });
});
