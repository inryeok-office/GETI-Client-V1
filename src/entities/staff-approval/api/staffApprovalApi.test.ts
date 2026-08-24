import type { AxiosAdapter, AxiosResponse } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';

import { api } from '@/shared/api';

import { executeStaffApprovalAction, fetchStaffApprovalRequests } from './staffApprovalApi';
import type { AdminMemberSearchItem } from './staffApprovalApi';

/** `applicantApi.test.ts`와 같은 방식으로 실제 `api` 인스턴스의 adapter를 캡처한다. */
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

function searchItem(overrides: Partial<AdminMemberSearchItem> = {}): AdminMemberSearchItem {
  return {
    memberId: 1,
    email: 'teacher@gsm.hs.kr',
    name: '이름',
    status: 'PENDING',
    createdAt: '2026-08-01T09:24:00',
    ...overrides,
  };
}

describe('fetchStaffApprovalRequests', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('role=TEACHER로 조회하고 status 탭이 없으면 status 파라미터를 보내지 않는다', async () => {
    const stub = stubServer(() => ({ success: true, data: { content: [] } }));
    restore = stub.restore;

    await fetchStaffApprovalRequests();

    expect(stub.requests).toHaveLength(1);
    expect(stub.requests[0]).toMatchObject({
      url: '/api/v1/admin/members/search',
      params: { role: 'TEACHER', status: undefined, page: 0, size: 100 },
    });
  });

  it('탭이 지정되면 서버 상태로 변환해 status 파라미터로 보낸다', async () => {
    const stub = stubServer(() => ({ success: true, data: { content: [] } }));
    restore = stub.restore;

    await fetchStaffApprovalRequests('pending');

    expect(stub.requests[0]?.params).toMatchObject({ status: 'PENDING' });
  });

  it('SUSPENDED · WITHDRAWN 항목은 결과에서 제외된다', async () => {
    const stub = stubServer(() => ({
      success: true,
      data: {
        content: [
          searchItem({ memberId: 1, status: 'PENDING' }),
          searchItem({ memberId: 2, status: 'SUSPENDED' }),
          searchItem({ memberId: 3, status: 'WITHDRAWN' }),
        ],
      },
    }));
    restore = stub.restore;

    const result = await fetchStaffApprovalRequests();

    expect(result).toHaveLength(1);
    expect(result[0]?.memberId).toBe(1);
  });
});

describe('executeStaffApprovalAction', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('승인은 reason 없이 action만 보낸다', async () => {
    const stub = stubServer(() => ({ success: true, data: null }));
    restore = stub.restore;

    await executeStaffApprovalAction({ memberId: 42, action: 'APPROVE' });

    expect(stub.requests[0]).toMatchObject({
      url: '/api/v1/admin/members/42/approval-actions',
      method: 'post',
      data: JSON.stringify({ action: 'APPROVE', reason: null }),
    });
  });

  it('거절은 reason을 함께 보낸다', async () => {
    const stub = stubServer(() => ({ success: true, data: null }));
    restore = stub.restore;

    await executeStaffApprovalAction({ memberId: 42, action: 'REJECT', reason: '사유' });

    expect(stub.requests[0]).toMatchObject({
      url: '/api/v1/admin/members/42/approval-actions',
      data: JSON.stringify({ action: 'REJECT', reason: '사유' }),
    });
  });
});
