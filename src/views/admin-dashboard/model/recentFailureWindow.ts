const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/** UTC 밀리초를 KST(UTC+9, DST 없음) 벽시계 `LocalDateTime` 문자열로 변환한다. */
function toKstLocalDateTime(utcMs: number): string {
  return new Date(utcMs + 9 * HOUR_MS).toISOString().slice(0, 19);
}

/**
 * 개발자 대시보드 "최근 실패 내역"의 하한 시각(현재 기준 24시간 전, 시 경계로 내림).
 * Server Component에서 한 번 계산해 넘겨야 렌더 중 `Date.now()` 호출과 쿼리 키 불안정을 피한다.
 */
export function recentFailureSince(now: number = Date.now()): string {
  const since = now - RECENT_WINDOW_MS;
  return toKstLocalDateTime(since - (since % HOUR_MS));
}
