const MINUTE_IN_MILLISECONDS = 60_000;
const HOUR_IN_MILLISECONDS = MINUTE_IN_MILLISECONDS * 60;
const DAY_IN_MILLISECONDS = HOUR_IN_MILLISECONDS * 24;

/** 서버의 LocalDateTime을 알림 패널의 상대 시각 문구로 변환한다. */
export function formatNotificationRelativeTime(value: string, now = new Date()): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const difference = Math.max(0, now.getTime() - date.getTime());
  if (difference < MINUTE_IN_MILLISECONDS) return '방금 전';
  if (difference < HOUR_IN_MILLISECONDS) {
    return `${Math.floor(difference / MINUTE_IN_MILLISECONDS)}분 전`;
  }
  if (difference < DAY_IN_MILLISECONDS) {
    return `${Math.floor(difference / HOUR_IN_MILLISECONDS)}시간 전`;
  }
  if (difference < DAY_IN_MILLISECONDS * 2) return '어제';
  if (difference < DAY_IN_MILLISECONDS * 7) {
    return `${Math.floor(difference / DAY_IN_MILLISECONDS)}일 전`;
  }

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}
