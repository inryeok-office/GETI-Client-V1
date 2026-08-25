import type { AxiosAdapter, AxiosResponse } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';

import { api } from '@/shared/api';

import { fetchAdminCompanyDetail } from './companyApi';

/** `staffApprovalApi.test.ts`와 같은 방식으로 실제 `api` 인스턴스의 adapter를 캡처한다. */
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

describe('fetchAdminCompanyDetail', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('GET /api/v1/admin/companies/{id}로 조회하고 응답 본문을 그대로 반환한다', async () => {
    const detail = {
      companyId: 1,
      name: '플로우테크',
      companyType: 'GENERAL',
      mouStatus: 'ACTIVE',
      sourceName: 'manual',
      homepageUrl: null,
      logoUrl: null,
      description: null,
      industry: null,
      address: null,
      mouStartDate: '2026-03-01',
      mouEndDate: '2027-02-28',
      representativeEmail: 'contact@flowtech.co.kr',
      representativePhone: '062-123-4567',
      memo: '메모',
      lastEditedBy: '홍길동',
      lastEditedAt: '2026-03-02T09:00:00',
      stats: { totalConnectedJobs: 1, activeJobCount: 1, totalApplicationCount: 3 },
      connectedJobs: [],
      recentChanges: [],
      createdAt: '2026-03-01T10:15:30',
      updatedAt: '2026-03-02T09:00:00',
    };
    const stub = stubServer(() => ({ success: true, data: detail }));
    restore = stub.restore;

    const result = await fetchAdminCompanyDetail(1);

    expect(stub.requests).toHaveLength(1);
    expect(stub.requests[0]).toMatchObject({ url: '/api/v1/admin/companies/1', method: 'get' });
    expect(result).toEqual(detail);
  });
});
