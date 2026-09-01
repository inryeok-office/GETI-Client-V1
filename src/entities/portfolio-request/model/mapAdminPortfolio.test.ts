import { describe, expect, it } from 'vitest';

import { mapAdminPortfolioRequest, mapAdminPortfolioSubmission } from './mapAdminPortfolio';

describe('mapAdminPortfolio', () => {
  it('포트폴리오 요청 API 응답을 관리자 목록 표시 모델로 변환한다', () => {
    expect(
      mapAdminPortfolioRequest({
        createdAt: '2026-08-01T10:00:00',
        description: '제출 안내',
        dueAt: '2026-08-31T23:59:59',
        requestId: 1,
        status: 'PUBLISHED',
        submittedCount: 42,
        targetCount: 60,
        title: '상반기 포트폴리오',
        updatedAt: '2026-08-02T10:00:00',
      }),
    ).toEqual({
      createdAt: '2026.08.01',
      description: '제출 안내',
      dueAt: '2026-08-31T23:59:59',
      duePeriod: '2026.08.31까지',
      requestId: 1,
      status: 'OPEN',
      submittedCount: 42,
      target: '대상 60명',
      targetCount: 60,
      title: '상반기 포트폴리오',
    });
  });

  it('목록 응답에 없는 등록일은 대시로 표시한다', () => {
    expect(
      mapAdminPortfolioRequest({
        dueAt: '2026-08-31T23:59:59',
        requestId: 1,
        status: 'DRAFT',
        submittedCount: 0,
        targetCount: 1,
        title: '상반기 포트폴리오',
      }).createdAt,
    ).toBe('—');
  });

  it('포트폴리오 제출 현황 API 응답을 표시 모델로 변환한다', () => {
    expect(
      mapAdminPortfolioSubmission({
        cohort: 10,
        department: 'SW_DEVELOPMENT',
        materialType: 'BOTH',
        memberId: 11,
        status: 'SUBMITTED',
        studentName: '김민재',
        submitted: true,
        submittedAt: '2026-08-12T14:32:00',
      }),
    ).toEqual({
      cohortAndDepartment: '10기, 소프트웨어개발과',
      materialType: '파일 + URL',
      memberId: 11,
      status: 'SUBMITTED',
      studentName: '김민재',
      studentNumber: '-',
      submissionId: 11,
      submittedAt: '08.12 14:32',
    });
  });
});
