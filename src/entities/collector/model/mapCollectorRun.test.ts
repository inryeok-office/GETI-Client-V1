import { describe, expect, it } from 'vitest';

import type { CollectorRunApiDetail, CollectorRunApiSummary } from './types';
import { mapCollectorRunDetail, mapCollectorRunSummary } from './mapCollectorRun';

const SUMMARY: CollectorRunApiSummary = {
  action: 'COLLECT',
  createdCount: null,
  failedCount: 2,
  failureCount: 2,
  finishedAt: '2026-08-01T09:05:00',
  partialQualityCount: 1,
  runId: 7,
  sourceId: 3,
  sourceName: 'JOB-ALIO',
  startedAt: '2026-08-01T09:00:12',
  status: 'PARTIAL_SUCCESS',
  successCount: 10,
  updatedCount: 4,
};

describe('collector run mapper', () => {
  it('목록 응답의 날짜와 오류 여부를 화면 모델로 변환한다', () => {
    expect(mapCollectorRunSummary(SUMMARY)).toEqual({
      createdCount: null,
      executedAt: '2026.08.01 09:00:12',
      failedCount: 2,
      hasErrors: true,
      runId: 7,
      sourceName: 'JOB-ALIO',
      status: 'PARTIAL_SUCCESS',
      updatedCount: 4,
    });
  });

  it('상세 오류 코드와 메시지를 오류 요약으로 변환한다', () => {
    const detail: CollectorRunApiDetail = {
      ...SUMMARY,
      errors: [
        {
          code: 'SOURCE_TIMEOUT',
          externalJobId: null,
          message: '수집원 응답 시간이 초과되었습니다.',
          missingFields: [],
          occurredAt: '2026-08-01T09:01:00',
        },
      ],
      totalCount: 12,
    };

    expect(mapCollectorRunDetail(detail).errorSummary).toEqual([
      { title: 'SOURCE_TIMEOUT', description: '수집원 응답 시간이 초과되었습니다.' },
    ]);
  });

  it('해석할 수 없는 날짜는 서버 값을 그대로 유지한다', () => {
    expect(mapCollectorRunSummary({ ...SUMMARY, startedAt: 'invalid-date' }).executedAt).toBe(
      'invalid-date',
    );
  });
});
