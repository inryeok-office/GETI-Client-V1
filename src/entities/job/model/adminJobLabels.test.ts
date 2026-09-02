import { describe, expect, it } from 'vitest';

import {
  formatAiAnalysisSummary,
  formatDateTimeMinute,
  formatJobDeadlineState,
  formatJobPublicState,
} from './adminJobLabels';

describe('formatJobPublicState', () => {
  it('PUBLISHED·CLOSED는 공개, DRAFT는 비공개, DELETED는 삭제됨으로 표시한다', () => {
    expect(formatJobPublicState('PUBLISHED')).toBe('공개');
    expect(formatJobPublicState('CLOSED')).toBe('공개');
    expect(formatJobPublicState('DRAFT')).toBe('비공개');
    expect(formatJobPublicState('DELETED')).toBe('삭제됨');
  });
});

describe('formatJobDeadlineState', () => {
  it('PUBLISHED는 모집 중, CLOSED는 마감, 그 외는 null', () => {
    expect(formatJobDeadlineState('PUBLISHED')).toBe('모집 중');
    expect(formatJobDeadlineState('CLOSED')).toBe('마감');
    expect(formatJobDeadlineState('DRAFT')).toBeNull();
    expect(formatJobDeadlineState('DELETED')).toBeNull();
  });
});

describe('formatAiAnalysisSummary', () => {
  it('완료면 분석 시각을 덧붙이고, 분석이 없으면 "AI 분석 전"', () => {
    expect(formatAiAnalysisSummary('COMPLETED', '2026-08-01T09:12:00')).toBe(
      '분석 완료 · 2026.08.01 09:12',
    );
    expect(formatAiAnalysisSummary('COMPLETED', null)).toBe('분석 완료');
    expect(formatAiAnalysisSummary('PROCESSING', null)).toBe('분석 중');
    expect(formatAiAnalysisSummary(null, null)).toBe('AI 분석 전');
  });
});

describe('formatDateTimeMinute', () => {
  it('ISO 문자열을 Date 파싱 없이 "YYYY.MM.DD HH:mm"으로 자른다', () => {
    expect(formatDateTimeMinute('2026-08-01T08:58:37')).toBe('2026.08.01 08:58');
    expect(formatDateTimeMinute('2026-08-01')).toBe('2026.08.01');
  });
});
