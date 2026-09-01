import { describe, expect, it } from 'vitest';

import type { AdminJobDetail } from '@/entities/job';

import {
  EMPTY_JOB_FORM_VALUES,
  toJobCreatePayload,
  toJobFormValues,
  toJobUpdatePayload,
} from './jobFormValues';

function detail(overrides: Partial<AdminJobDetail> = {}): AdminJobDetail {
  return {
    jobId: 1,
    title: '프론트엔드 개발자 채용',
    postingType: 'MOU',
    applicationMethod: 'EXTERNAL',
    status: 'PUBLISHED',
    company: { companyId: 7, name: '플로우테크', logoUrl: null },
    content: '## 모집\n- FE',
    externalUrl: 'https://example.com/apply',
    startDate: '2026-08-01T00:00:00',
    endDate: '2026-08-31T23:59:59',
    targetGrade: 3,
    capacity: 2,
    location: '서울특별시 중구',
    employmentType: '인턴',
    firstComeServed: true,
    viewCount: 0,
    publishedAt: '2026-08-01T09:00:00',
    closedAt: null,
    createdAt: '2026-07-20T10:00:00',
    updatedAt: '2026-08-01T08:58:00',
    aiAnalysis: null,
    application: {
      canApply: false,
      eligibilityReason: 'JOB_NOT_PUBLISHED',
      eligibilityMessage: '',
      applicationId: null,
      applicationStatus: null,
      availableActions: [],
    },
    bookmarked: false,
    files: [],
    ...overrides,
  };
}

describe('toJobFormValues', () => {
  it('상세 응답을 폼 값으로 바꾸고 날짜는 YYYY-MM-DD로 자른다', () => {
    expect(toJobFormValues(detail())).toEqual({
      companyId: '7',
      postingType: 'MOU',
      applicationMethod: 'EXTERNAL',
      title: '프론트엔드 개발자 채용',
      content: '## 모집\n- FE',
      externalUrl: 'https://example.com/apply',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      targetGrade: '3',
      capacity: '2',
      location: '서울특별시 중구',
      employmentType: '인턴',
      firstComeServed: true,
    });
  });

  it('null 필드는 빈 문자열/false로 채운다', () => {
    const values = toJobFormValues(
      detail({
        company: null,
        content: null,
        externalUrl: null,
        startDate: null,
        endDate: null,
        targetGrade: null,
        capacity: null,
        location: null,
        employmentType: null,
        firstComeServed: false,
      }),
    );

    expect(values).toMatchObject({
      companyId: '',
      content: '',
      externalUrl: '',
      startDate: '',
      targetGrade: '',
      capacity: '',
      firstComeServed: false,
    });
  });
});

describe('toJobCreatePayload', () => {
  it('identity 필드와 status를 담고 날짜를 LocalDateTime으로 확장한다', () => {
    const values = {
      ...EMPTY_JOB_FORM_VALUES,
      companyId: '7',
      postingType: 'GENERAL' as const,
      applicationMethod: 'EXTERNAL' as const,
      title: '  새 공고  ',
      content: '본문',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      targetGrade: '2',
      capacity: '3',
    };

    expect(toJobCreatePayload(values, 'PUBLISHED')).toEqual({
      companyId: 7,
      postingType: 'GENERAL',
      applicationMethod: 'EXTERNAL',
      title: '새 공고',
      status: 'PUBLISHED',
      content: '본문',
      externalUrl: undefined,
      startDate: '2026-09-01T00:00:00',
      endDate: '2026-09-30T23:59:59',
      targetGrade: 2,
      capacity: 3,
      location: undefined,
      employmentType: undefined,
      firstComeServed: false,
    });
  });

  it('빈 선택 필드는 undefined로 둔다', () => {
    const payload = toJobCreatePayload(
      {
        ...EMPTY_JOB_FORM_VALUES,
        companyId: '1',
        postingType: 'MOU',
        applicationMethod: 'INTERNAL',
        title: 'x',
      },
      'DRAFT',
    );

    expect(payload.content).toBeUndefined();
    expect(payload.startDate).toBeUndefined();
    expect(payload.targetGrade).toBeUndefined();
    expect(payload.status).toBe('DRAFT');
  });
});

describe('toJobUpdatePayload', () => {
  it('제목·본문·선착순은 항상, 빈 선택 필드는 생략(기존 값 유지)한다', () => {
    const payload = toJobUpdatePayload({
      ...EMPTY_JOB_FORM_VALUES,
      title: '수정 제목',
      content: '',
      firstComeServed: true,
      location: '부산',
    });

    expect(payload).toEqual({
      title: '수정 제목',
      content: undefined,
      externalUrl: undefined,
      startDate: undefined,
      endDate: undefined,
      targetGrade: undefined,
      capacity: undefined,
      location: '부산',
      employmentType: undefined,
      firstComeServed: true,
    });
  });
});
