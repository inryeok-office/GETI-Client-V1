/** `endDate`에서 D-day 숫자와 "MM.DD 마감" 라벨을 계산한다(목록 카드용). 마감일이 없으면(상시 채용) 둘 다 없다. */
export function formatDeadline(endDate: string | null): {
  dDay: number | null;
  deadlineLabel: string;
} {
  if (!endDate) return { dDay: null, deadlineLabel: '상시 채용' };

  // 날짜 차이 계산 자체는 Date 연산이 필요하지만, 표시용 월·일은 formatDateOnly와 마찬가지로
  // 문자열을 그대로 잘라 쓴다 — 로컬 타임존 파싱을 거치지 않아 서버가 보낸 날짜와 항상 일치한다.
  const diffMs = new Date(endDate).getTime() - Date.now();
  const dDay = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const [, month, day] = endDate.slice(0, 10).split('-');

  return { dDay, deadlineLabel: `${month}.${day} 마감` };
}

/**
 * ISO 날짜/시각 문자열을 "YYYY.MM.DD"로 바꾼다(상세 화면의 모집 기간 행 등에 쓴다).
 * `entities/program`의 `formatProgramDate`와 동일하게 Date 파싱 없이 문자열만 자른다 —
 * 로컬 타임존에 따라 날짜가 밀리는 걸 원천적으로 피한다.
 */
export function formatDateOnly(date: string): string {
  return date.slice(0, 10).replaceAll('-', '.');
}
