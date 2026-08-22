/**
 * `LocalDateTime` 문자열("2026-08-20T09:00:00")을 상세 패널용 "2026.08.20 09:00:00"로 바꾼다.
 * `entities/job`의 `formatDateOnly`와 같은 이유로 Date 파싱 없이 문자열만 자른다 — 로컬
 * 타임존에 따라 시각이 밀리는 걸 피한다.
 */
export function formatDeliveryDateTime(dateTime: string): string {
  return `${dateTime.slice(0, 10).replaceAll('-', '.')} ${dateTime.slice(11, 19)}`;
}

/** 목록 테이블용 짧은 표기("08.20 09:00"). */
export function formatDeliveryDateTimeShort(dateTime: string): string {
  const [, month, day] = dateTime.slice(0, 10).split('-');
  return `${month}.${day} ${dateTime.slice(11, 16)}`;
}
