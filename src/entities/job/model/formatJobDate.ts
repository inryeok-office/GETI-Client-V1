/** `endDate`에서 D-day 숫자와 "MM.DD 마감" 라벨을 계산한다(목록 카드용). 마감일이 없으면(상시 채용) 둘 다 없다. */
export function formatDeadline(endDate: string | null): { dDay: number | null; deadlineLabel: string } {
  if (!endDate) return { dDay: null, deadlineLabel: '상시 채용' };

  const end = new Date(endDate);
  const diffMs = end.getTime() - Date.now();
  const dDay = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const month = String(end.getMonth() + 1).padStart(2, '0');
  const day = String(end.getDate()).padStart(2, '0');

  return { dDay, deadlineLabel: `${month}.${day} 마감` };
}

/** ISO 날짜/시각 문자열을 "YYYY.MM.DD"로 바꾼다(상세 화면의 모집 기간 행 등에 쓴다). */
export function formatDateOnly(date: string): string {
  const parsed = new Date(date);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}
