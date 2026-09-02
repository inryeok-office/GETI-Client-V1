/**
 * ISO 문자열의 날짜 부분만 `YYYY.MM.DD`로 자른다. Date 파싱을 하지 않아 로컬 타임존에 따라
 * 날짜가 밀리지 않는다(`formatInquiryDate`·`formatDeliveryDate`와 같은 방식).
 */
export function formatMemberDate(dateTime: string): string {
  return dateTime.slice(0, 10).replaceAll('-', '.');
}

/** `YYYY.MM.DD HH:mm`까지. 상세 화면의 가입·수정·탈퇴 시각 표시에 쓴다. */
export function formatMemberDateTime(dateTime: string): string {
  const [date, time = ''] = dateTime.split('T');
  return `${date.replaceAll('-', '.')} ${time.slice(0, 5)}`.trim();
}
