const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** UTC 밀리초를 KST(UTC+9, DST 없음) 벽시계 `LocalDateTime` 문자열로 변환한다. */
function toKstLocalDateTime(utcMs: number): string {
  return new Date(utcMs + 9 * HOUR_MS).toISOString().slice(0, 19);
}

/**
 * 현재 기준 `windowMs` 전 시각을 KST 벽시계 `LocalDateTime` 문자열로, 시 경계로 내려서 반환한다.
 * Server Component에서 한 번 계산해 prop으로 넘겨야 렌더 중 `Date.now()` 호출과 쿼리 키
 * 불안정을 피한다.
 */
function kstSinceTruncatedToHour(now: number, windowMs: number): string {
  const since = now - windowMs;
  return toKstLocalDateTime(since - (since % HOUR_MS));
}

/** 개발자 대시보드 "최근 실패 내역"·"Discord 실패" KPI의 하한 시각(24시간 전). */
export function recentFailureSince(now: number = Date.now()): string {
  return kstSinceTruncatedToHour(now, DAY_MS);
}

/** 교직원 대시보드 "신규 지원자" KPI의 하한 시각(3일 전, GETI-Server-V1 #219 확정값). */
export function newApplicantSince(now: number = Date.now()): string {
  return kstSinceTruncatedToHour(now, 3 * DAY_MS);
}
