import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mapPortfolioRequestDetailToListItem,
  mapPortfolioRequestSummaryToListItem,
  mapRequestStatusToSubmissionStatus,
} from './mapPortfolioRequest';

describe('mapPortfolioRequest', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-29T00:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('목록 API 응답을 카드 모델로 변환한다', () => {
    expect(
      mapPortfolioRequestSummaryToListItem({
        dueAt: '2026-09-30T23:59:59',
        requestId: 1,
        status: 'PUBLISHED',
        submittedCount: 3,
        targetCount: 10,
        title: '포트폴리오 수합',
      }),
    ).toMatchObject({
      description: '3/10명 제출',
      requestId: '1',
      status: 'REQUIRED',
      submittedCount: 3,
      targetCount: 10,
      title: '포트폴리오 수합',
    });
  });

  it('상세 API 응답을 카드 모델로 변환한다', () => {
    expect(
      mapPortfolioRequestDetailToListItem({
        createdAt: '2026-09-01T09:00:00',
        description: '제출해 주세요.',
        dueAt: '2026-09-30T23:59:59',
        requestId: 1,
        status: 'CLOSED',
        submittedCount: 3,
        targetCount: 10,
        title: '포트폴리오 수합',
        updatedAt: null,
      }),
    ).toMatchObject({
      description: '제출해 주세요.',
      requestId: '1',
      status: 'CLOSED',
    });
  });

  it('백엔드 요청 상태를 학생 제출 상태로 변환한다', () => {
    expect(mapRequestStatusToSubmissionStatus('PUBLISHED')).toBe('REQUIRED');
    expect(mapRequestStatusToSubmissionStatus('CLOSED')).toBe('CLOSED');
  });
  it('마감 시간이 지난 PUBLISHED 요청은 목록에서 CLOSED로 표시한다', () => {
    expect(
      mapPortfolioRequestSummaryToListItem({
        dueAt: '2026-08-28T23:59:59',
        requestId: 1,
        status: 'PUBLISHED',
        submittedCount: 0,
        targetCount: 1,
        title: '포트폴리오 제출',
      }),
    ).toMatchObject({
      dDay: null,
      status: 'CLOSED',
    });
  });
});
