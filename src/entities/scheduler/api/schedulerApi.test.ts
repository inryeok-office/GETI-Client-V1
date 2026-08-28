import type { AxiosAdapter, AxiosResponse } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';

import { api } from '@/shared/api';

import { fetchOperationJobs } from './schedulerApi';
import type { OperationJob, OperationJobListResponse } from '../model/types';

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

function job(overrides: Partial<OperationJob> = {}): OperationJob {
  return {
    taskId: 'JOB_COLLECTION',
    jobType: 'JOB_COLLECTION',
    name: '외부 공고 수집',
    description: '',
    schedule: '',
    lastRunAt: null,
    nextRunAt: null,
    operationId: null,
    status: 'SUCCESS',
    processedCount: 0,
    successCount: 0,
    failureCount: 0,
    partialSuccessCount: 0,
    startedAt: null,
    finishedAt: null,
    lastError: null,
    actionStatus: 'UNSUPPORTED',
    ...overrides,
  };
}

function listResponse(overrides: Partial<OperationJobListResponse> = {}): OperationJobListResponse {
  return {
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    ...overrides,
  };
}

describe('fetchOperationJobs', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('기본값(page=0, size=20)으로 GET /admin/system/jobs를 호출한다', async () => {
    const stub = stubServer(() => ({ success: true, data: listResponse() }));
    restore = stub.restore;

    await fetchOperationJobs();

    expect(stub.requests).toHaveLength(1);
    expect(stub.requests[0]).toMatchObject({
      url: '/api/v1/admin/system/jobs',
      params: { page: 0, size: 20 },
    });
  });

  it('jobType·status 필터를 그대로 전달하고 응답을 반환한다', async () => {
    const response = listResponse({
      content: [job({ status: 'FAILED', failureCount: 4 })],
      totalElements: 1,
    });
    const stub = stubServer(() => ({ success: true, data: response }));
    restore = stub.restore;

    const result = await fetchOperationJobs({
      jobType: 'JOB_COLLECTION',
      status: 'FAILED',
      size: 1,
    });

    expect(stub.requests[0]).toMatchObject({
      params: { page: 0, size: 1, jobType: 'JOB_COLLECTION', status: 'FAILED' },
    });
    expect(result).toEqual(response);
  });
});
