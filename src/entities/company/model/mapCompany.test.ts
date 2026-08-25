import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mapAdminCompanyAuditLogEntry,
  mapAdminCompanyConnectedJob,
  mapAdminCompanyDetail,
} from './mapCompany';
import type {
  AdminCompanyAuditLogEntryRecord,
  AdminCompanyConnectedJobRecord,
  AdminCompanyDetailRecord,
} from './types';

function detailRecord(overrides: Partial<AdminCompanyDetailRecord> = {}): AdminCompanyDetailRecord {
  return {
    companyId: 1,
    name: '플로우테크',
    companyType: 'GENERAL',
    mouStatus: 'ACTIVE',
    sourceName: 'manual',
    homepageUrl: null,
    logoUrl: null,
    description: null,
    industry: null,
    address: '광주광역시 북구 첨단과기로 123',
    mouStartDate: '2026-03-01',
    mouEndDate: '2027-02-28',
    representativeEmail: 'contact@flowtech.co.kr',
    representativePhone: '062-123-4567',
    memo: '메모',
    lastEditedBy: '홍길동',
    lastEditedAt: '2026-03-02T09:00:00',
    stats: { totalConnectedJobs: 0, activeJobCount: 0, totalApplicationCount: 0 },
    connectedJobs: [],
    recentChanges: [],
    createdAt: '2026-03-01T10:15:30',
    updatedAt: '2026-03-02T09:00:00',
    ...overrides,
  };
}

describe('mapAdminCompanyDetail', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 종료일(mouEndDate)도 시각 없는 날짜 문자열이라 UTC로 파싱된다 — 로컬 타임존과 무관하게
    // 정확히 24시간 배수의 차이가 나도록 시스템 시각도 같은 방식(날짜만)으로 맞춘다.
    vi.setSystemTime(new Date('2026-08-24'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('기본 필드를 그대로 옮기고 날짜를 화면 형식으로 바꾼다', () => {
    const result = mapAdminCompanyDetail(detailRecord());

    expect(result.id).toBe('1');
    expect(result.representativeEmail).toBe('contact@flowtech.co.kr');
    expect(result.registeredAt).toBe('2026.03.01');
    expect(result.lastEditedAt).toBe('2026.03.02 09:00');
    expect(result.mouPeriod).toBe('2026.03.01 ~ 2027.02.28');
    expect(result.memo).toBe('메모');
  });

  it('null인 필드는 "—"로 대체한다', () => {
    const result = mapAdminCompanyDetail(
      detailRecord({
        representativeEmail: null,
        representativePhone: null,
        address: null,
        lastEditedBy: null,
        lastEditedAt: null,
        createdAt: null,
      }),
    );

    expect(result.representativeEmail).toBe('—');
    expect(result.representativePhone).toBe('—');
    expect(result.address).toBe('—');
    expect(result.lastEditedBy).toBe('—');
    expect(result.lastEditedAt).toBe('—');
    expect(result.registeredAt).toBe('—');
  });

  it.each([
    ['manual', 'direct'],
    [null, 'direct'],
    ['사람인', 'external'],
  ] as const)('sourceName %s은 infoSource %s로 매핑한다', (sourceName, expected) => {
    const result = mapAdminCompanyDetail(detailRecord({ sourceName }));
    expect(result.infoSource).toBe(expected);
  });

  it('MOU 시작일·종료일 중 하나라도 없으면 mouPeriod는 null이다', () => {
    const result = mapAdminCompanyDetail(detailRecord({ mouStartDate: null }));
    expect(result.mouPeriod).toBeNull();
  });

  it.each(['NONE', 'EXPIRED', 'TERMINATED'] as const)(
    'MOU 상태가 %s면 mouDaysLeft는 null이다',
    (mouStatus) => {
      const result = mapAdminCompanyDetail(detailRecord({ mouStatus }));
      expect(result.mouDaysLeft).toBeNull();
    },
  );

  it('ACTIVE면 mouDaysLeft를 종료일까지 남은 일수로 계산한다', () => {
    const result = mapAdminCompanyDetail(
      detailRecord({ mouStatus: 'ACTIVE', mouEndDate: '2026-08-29' }),
    );
    expect(result.mouDaysLeft).toBe(5);
  });
});

describe('mapAdminCompanyConnectedJob', () => {
  function jobRecord(
    overrides: Partial<AdminCompanyConnectedJobRecord> = {},
  ): AdminCompanyConnectedJobRecord {
    return {
      jobId: 10,
      title: 'Backend 개발자 채용',
      postingType: 'MOU',
      status: 'PUBLISHED',
      applicantCount: 7,
      ...overrides,
    };
  }

  it.each([
    ['GENERAL', '일반 공고'],
    ['MOU', 'MOU 공고'],
    ['SCHOOL', '학교 공고'],
  ])('postingType %s를 %s로 매핑한다', (postingType, expected) => {
    const result = mapAdminCompanyConnectedJob(jobRecord({ postingType }));
    expect(result.type).toBe(expected);
  });

  it('모르는 postingType은 원본값을 그대로 보여준다', () => {
    const result = mapAdminCompanyConnectedJob(jobRecord({ postingType: 'UNKNOWN' }));
    expect(result.type).toBe('UNKNOWN');
  });

  it.each([
    ['PUBLISHED', 'open'],
    ['CLOSED', 'closed'],
    ['DRAFT', 'reviewing'],
    ['DELETED', 'closed'],
  ])('status %s를 %s로 매핑한다', (status, expected) => {
    const result = mapAdminCompanyConnectedJob(jobRecord({ status }));
    expect(result.status).toBe(expected);
  });

  it('detailHref는 jobId로 지원자 관리 화면의 공고 필터 링크를 만든다', () => {
    const result = mapAdminCompanyConnectedJob(jobRecord({ jobId: 42 }));
    expect(result.detailHref).toBe('/admin/applicants?jobId=42');
  });
});

describe('mapAdminCompanyAuditLogEntry', () => {
  function auditRecord(
    overrides: Partial<AdminCompanyAuditLogEntryRecord> = {},
  ): AdminCompanyAuditLogEntryRecord {
    return {
      id: 1,
      title: 'COMPANY_UPDATED',
      actedAtWithActor: '2026-03-02T09:00:00 · 홍길동',
      ...overrides,
    };
  }

  it.each([
    ['COMPANY_CREATED', '기업 등록'],
    ['COMPANY_UPDATED', '기업 정보 수정'],
    ['COMPANY_DELETED', '기업 삭제'],
  ])('액션 코드 %s를 %s로 매핑한다', (title, expected) => {
    const result = mapAdminCompanyAuditLogEntry(auditRecord({ title }));
    expect(result.title).toBe(expected);
  });

  it('모르는 액션 코드는 원본값을 그대로 보여준다', () => {
    const result = mapAdminCompanyAuditLogEntry(auditRecord({ title: 'UNKNOWN_ACTION' }));
    expect(result.title).toBe('UNKNOWN_ACTION');
  });

  it('타임스탬프 부분만 화면 형식으로 다시 포맷하고 담당자 이름은 그대로 둔다', () => {
    const result = mapAdminCompanyAuditLogEntry(auditRecord());
    expect(result.actedAtWithActor).toBe('2026.03.02 09:00 · 홍길동');
  });

  it('구분자가 없는 예상 밖 형식은 원본을 그대로 둔다', () => {
    const result = mapAdminCompanyAuditLogEntry(auditRecord({ actedAtWithActor: '이상한 형식' }));
    expect(result.actedAtWithActor).toBe('이상한 형식');
  });
});
