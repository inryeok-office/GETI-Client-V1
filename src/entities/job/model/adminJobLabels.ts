import type { AdminJobStatus, AiDifficulty, AiFitLevel, JobAiAnalysisStatus } from './types';

/** 표시할 값이 없을 때 셀에 넣는 문자(`ApplicantTable`과 동일). */
export const EMPTY_CELL = 'ㅡ';

/**
 * 공고 상태 → "공개 상태" 표시. PUBLISHED·CLOSED는 학생에게 노출된 적이 있으므로 "공개",
 * DRAFT는 "비공개", DELETED는 "삭제됨". 목록(`JobSummary`)은 PUBLISHED·CLOSED만 오고,
 * 관리자 상세(`AdminJobDetail`)만 DRAFT·DELETED가 올 수 있다.
 */
export function formatJobPublicState(status: AdminJobStatus): string {
  switch (status) {
    case 'DRAFT':
      return '비공개';
    case 'DELETED':
      return '삭제됨';
    default:
      return '공개';
  }
}

/**
 * 공고 상태 → "마감 상태" 표시. PUBLISHED는 "모집 중", CLOSED는 "마감".
 * DRAFT·DELETED는 모집 개념이 없어 `null` — 표시할지 말지는 호출부가 정한다
 * (표는 `EMPTY_CELL`로, 상세 부제목은 생략).
 */
export function formatJobDeadlineState(status: AdminJobStatus): string | null {
  switch (status) {
    case 'PUBLISHED':
      return '모집 중';
    case 'CLOSED':
      return '마감';
    default:
      return null;
  }
}

/** AI 분석 결과의 짧은 라벨(관리자 상세 카드의 고졸/신입 지원). `AiAnalysisBox`의 긴 문구와 구분한다. */
export const AI_FIT_SHORT_LABEL: Record<AiFitLevel, string> = {
  SUITABLE: '가능',
  CONDITIONAL: '조건부',
  UNSUITABLE: '불가',
};

export const AI_DIFFICULTY_LABEL: Record<AiDifficulty, string> = {
  EASY: '쉬움',
  NORMAL: '보통',
  HARD: '어려움',
};

/**
 * AI 분석 진행 상태 → 카드 상단 한 줄 요약. 완료면 분석 시각을 덧붙인다.
 * 분석이 아직 없으면(`null`) "AI 분석 전".
 */
export function formatAiAnalysisSummary(
  status: JobAiAnalysisStatus | null,
  analyzedAt: string | null,
): string {
  switch (status) {
    case 'COMPLETED':
      return analyzedAt ? `분석 완료 · ${formatDateTimeMinute(analyzedAt)}` : '분석 완료';
    case 'PROCESSING':
      return '분석 중';
    case 'PENDING':
      return '분석 대기';
    case 'FAILED':
      return '분석 실패';
    default:
      return 'AI 분석 전';
  }
}

/**
 * ISO 날짜/시각 문자열을 "YYYY.MM.DD HH:mm"으로 바꾼다(관리자 상세의 "마지막 수정" 등).
 * `formatDateOnly`와 같이 Date 파싱 없이 문자열만 자른다 — 로컬 타임존에 따라 시각이 밀리지 않는다.
 */
export function formatDateTimeMinute(dateTime: string): string {
  const [date, time] = dateTime.split('T');
  const day = date.replaceAll('-', '.');
  if (!time) return day;
  return `${day} ${time.slice(0, 5)}`;
}
