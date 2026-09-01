import type { AxiosAdapter, AxiosResponse } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';

import { api } from '@/shared/api';

import {
  exportJobApplications,
  fetchAllJobApplicants,
  fetchApplicantList,
  fetchApplicationStatusCounts,
  fetchTeacherOptions,
} from './applicantApi';
import type { ApplicantListItem, ApplicantListResponse } from '../model/types';

/** `discordDeliveryApi.test.ts`와 같은 방식으로 실제 `api` 인스턴스의 adapter를 캡처한다. */
function stubServer(handler: (config: Parameters<AxiosAdapter>[0]) => unknown) {
  const requests: Parameters<AxiosAdapter>[0][] = [];
  const originalAdapter = api.defaults.adapter;

  api.defaults.adapter = async (config) => {
    requests.push(config);
    return {
      data: handler(config),
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as AxiosResponse;
  };

  return { requests, restore: () => (api.defaults.adapter = originalAdapter) };
}

function listResponse(overrides: Partial<ApplicantListResponse> = {}): ApplicantListResponse {
  return {
    content: [],
    page: 0,
    size: 100,
    totalElements: 0,
    totalPages: 1,
    first: true,
    last: true,
    ...overrides,
  };
}

/** `fetchAllJobApplicants`는 applicationId/applicantName만 읽지만, 캐스팅 없이 타입을 만족시키려면
 * 나머지 필수 필드도 채워야 한다. */
function applicantListItem(overrides: Partial<ApplicantListItem> = {}): ApplicantListItem {
  return {
    applicationId: 0,
    jobId: 10,
    applicantMemberId: 0,
    applicantName: null,
    applicantCohort: null,
    applicantDepartment: null,
    jobTitle: null,
    companyName: null,
    managerMemberId: null,
    managerName: null,
    status: 'SUBMITTED',
    submittedAt: null,
    createdAt: '2026-08-01T00:00:00',
    ...overrides,
  };
}

describe('fetchApplicantList', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('createdFrom·mineOnly 등 필터를 그대로 전달한다', async () => {
    const stub = stubServer(() => ({ success: true, data: listResponse({ totalElements: 14 }) }));
    restore = stub.restore;

    await fetchApplicantList({
      createdFrom: '2026-08-24T00:00:00',
      mineOnly: true,
      size: 1,
    });

    expect(stub.requests[0]).toMatchObject({
      url: '/api/v1/admin/job-applications',
      params: { page: 0, size: 1, createdFrom: '2026-08-24T00:00:00', mineOnly: true },
    });
  });
});

describe('fetchAllJobApplicants', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('jobId로 필터링해 페이지 크기 100으로 첫 페이지를 조회한다', async () => {
    const stub = stubServer(() => ({ success: true, data: listResponse() }));
    restore = stub.restore;

    await fetchAllJobApplicants(10);

    expect(stub.requests).toHaveLength(1);
    expect(stub.requests[0]).toMatchObject({
      url: '/api/v1/admin/job-applications',
      params: { jobId: 10, page: 0, size: 100 },
    });
  });

  it('totalPages가 1보다 크면 남은 페이지를 모두 조회해 합친다', async () => {
    const page0 = listResponse({
      content: [applicantListItem({ applicationId: 1, applicantName: '박서준' })],
      totalPages: 2,
    });
    const page1 = listResponse({
      content: [applicantListItem({ applicationId: 2, applicantName: '박보검' })],
      totalPages: 2,
    });
    const stub = stubServer((config) => ({
      success: true,
      data: config.params.page === 0 ? page0 : page1,
    }));
    restore = stub.restore;

    const result = await fetchAllJobApplicants(10);

    expect(stub.requests).toHaveLength(2);
    expect(result).toEqual([
      { applicationId: 1, applicantName: '박서준' },
      { applicationId: 2, applicantName: '박보검' },
    ]);
  });
});

describe('fetchTeacherOptions', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('role=TEACHER로 GET하고 members 배열을 반환한다', async () => {
    const stub = stubServer(() => ({
      success: true,
      data: {
        members: [
          { memberId: 1, name: '강교사' },
          { memberId: 2, name: '김교사' },
        ],
      },
    }));
    restore = stub.restore;

    const result = await fetchTeacherOptions();

    expect(stub.requests).toHaveLength(1);
    expect(stub.requests[0]).toMatchObject({
      url: '/api/v1/admin/members',
      params: { role: 'TEACHER' },
    });
    expect(result).toEqual([
      { memberId: 1, name: '강교사' },
      { memberId: 2, name: '김교사' },
    ]);
  });

  it('name이 null인 회원도 그대로 전달한다', async () => {
    const stub = stubServer(() => ({
      success: true,
      data: { members: [{ memberId: 3, name: null }] },
    }));
    restore = stub.restore;

    const result = await fetchTeacherOptions();

    expect(result).toEqual([{ memberId: 3, name: null }]);
  });
});

describe('fetchApplicationStatusCounts', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('status-counts를 GET하고 totalCount·counts를 반환한다', async () => {
    const stub = stubServer(() => ({
      success: true,
      data: { totalCount: 84, counts: { SUBMITTED: 42, REVISION_REQUESTED: 14, APPROVED: 28 } },
    }));
    restore = stub.restore;

    const result = await fetchApplicationStatusCounts();

    expect(stub.requests).toHaveLength(1);
    expect(stub.requests[0]).toMatchObject({
      url: '/api/v1/admin/job-applications/status-counts',
    });
    expect(result).toEqual({
      totalCount: 84,
      counts: { SUBMITTED: 42, REVISION_REQUESTED: 14, APPROVED: 28 },
    });
  });
});

describe('exportJobApplications', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('applicationIds를 생략하면 params 없이 GET한다(공고 전체 대상, 하위 호환)', async () => {
    const stub = stubServer(() => new Blob(['zip']));
    restore = stub.restore;

    await exportJobApplications({ jobId: 10 });

    expect(stub.requests).toHaveLength(1);
    expect(stub.requests[0]).toMatchObject({
      url: '/api/v1/admin/jobs/10/applications/export',
      method: 'get',
      responseType: 'blob',
    });
    expect(stub.requests[0].params).toBeUndefined();
  });

  it('applicationIds를 지정하면 params로 전달하고 indexes:null로 반복 키 직렬화를 강제한다', async () => {
    const stub = stubServer(() => new Blob(['zip']));
    restore = stub.restore;

    await exportJobApplications({ jobId: 10, applicationIds: [1, 2, 3] });

    expect(stub.requests[0]).toMatchObject({
      params: { applicationIds: [1, 2, 3] },
      paramsSerializer: { indexes: null },
    });
  });

  it('materialTypes를 반복 키로 전달하고, 비면 생략한다', async () => {
    const stub = stubServer(() => new Blob(['zip']));
    restore = stub.restore;

    await exportJobApplications({ jobId: 10, materialTypes: ['PROFILE', 'ANSWERS'] });
    expect(stub.requests[0]).toMatchObject({
      params: { materialTypes: ['PROFILE', 'ANSWERS'] },
      paramsSerializer: { indexes: null },
    });

    await exportJobApplications({ jobId: 10, materialTypes: [] });
    expect(stub.requests[1].params).toBeUndefined();
  });
});
