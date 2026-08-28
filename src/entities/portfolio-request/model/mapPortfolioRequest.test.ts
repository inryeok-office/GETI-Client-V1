import { describe, expect, it } from 'vitest';

import {
  mapPortfolioRequestDetailToListItem,
  mapPortfolioRequestSummaryToListItem,
  mapRequestStatusToSubmissionStatus,
} from './mapPortfolioRequest';

describe('mapPortfolioRequest', () => {
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
});
