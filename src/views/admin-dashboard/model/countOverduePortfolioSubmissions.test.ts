import { describe, expect, it } from 'vitest';

import type { PortfolioRequestSummaryResponse } from '@/entities/portfolio-request';

import { countOverduePortfolioSubmissions } from './countOverduePortfolioSubmissions';

function request(
  overrides: Partial<PortfolioRequestSummaryResponse> = {},
): PortfolioRequestSummaryResponse {
  return {
    requestId: 1,
    title: '2026 하반기 포트폴리오',
    status: 'PUBLISHED',
    dueAt: '2020-01-01T00:00:00',
    targetCount: 10,
    submittedCount: 4,
    ...overrides,
  };
}

describe('countOverduePortfolioSubmissions', () => {
  it('명시적으로 CLOSED인 요청의 미제출 인원을 더한다', () => {
    const count = countOverduePortfolioSubmissions([
      request({ status: 'CLOSED', targetCount: 10, submittedCount: 4 }),
    ]);

    expect(count).toBe(6);
  });

  it('PUBLISHED인데 마감일이 지난 요청도 미제출로 센다', () => {
    const count = countOverduePortfolioSubmissions([
      request({
        status: 'PUBLISHED',
        dueAt: '2020-01-01T00:00:00',
        targetCount: 5,
        submittedCount: 1,
      }),
    ]);

    expect(count).toBe(4);
  });

  it('PUBLISHED이고 마감일이 남은 요청은 제외한다', () => {
    const count = countOverduePortfolioSubmissions([
      request({
        status: 'PUBLISHED',
        dueAt: '2999-01-01T00:00:00',
        targetCount: 5,
        submittedCount: 1,
      }),
    ]);

    expect(count).toBe(0);
  });

  it('DRAFT · DELETED 요청은 대상에서 뺀다', () => {
    const count = countOverduePortfolioSubmissions([
      request({ status: 'DRAFT', targetCount: 5, submittedCount: 0 }),
      request({ status: 'DELETED', targetCount: 5, submittedCount: 0 }),
    ]);

    expect(count).toBe(0);
  });

  it('여러 요청을 합산한다', () => {
    const count = countOverduePortfolioSubmissions([
      request({ status: 'CLOSED', targetCount: 10, submittedCount: 4 }),
      request({
        status: 'PUBLISHED',
        dueAt: '2020-01-01T00:00:00',
        targetCount: 5,
        submittedCount: 1,
      }),
      request({
        status: 'PUBLISHED',
        dueAt: '2999-01-01T00:00:00',
        targetCount: 5,
        submittedCount: 1,
      }),
    ]);

    expect(count).toBe(10);
  });

  it('빈 목록이면 0이다', () => {
    expect(countOverduePortfolioSubmissions([])).toBe(0);
  });
});
