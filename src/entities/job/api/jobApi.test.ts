import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';

import { api } from '@/shared/api';

import { downloadJobAttachment, fetchAdminJobDetail } from './jobApi';

/**
 * `discordDeliveryApi.test.ts`와 같은 방식으로 실제 `api` 인스턴스의 adapter를 갈아 끼운다 —
 * `@/shared/api`를 통째로 mock하면 실제 호출 경로·responseType 계약이 틀려도 테스트가
 * 통과한다(PR #147 코드리뷰 반영 — `downloadUrl`이 인증이 필요한 GETI 자체 다운로드 경로임을
 * 이 테스트로 고정한다).
 */
function stubServer(handler: (config: Parameters<AxiosAdapter>[0]) => unknown) {
  const requests: { url: string; method?: string; responseType?: string }[] = [];
  const originalAdapter = api.defaults.adapter;

  api.defaults.adapter = async (config) => {
    requests.push({
      url: config.url ?? '',
      method: config.method,
      responseType: config.responseType,
    });
    const result = handler(config);

    if (result instanceof AxiosError) throw Object.assign(result, { config });

    return { data: result, status: 200, statusText: 'OK', headers: {}, config } as AxiosResponse;
  };

  return { requests, restore: () => (api.defaults.adapter = originalAdapter) };
}

describe('downloadJobAttachment', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('GETI 자체 다운로드 경로(JobAttachment.downloadUrl)를 responseType: blob으로 GET한다', async () => {
    const blob = new Blob(['content']);
    const stub = stubServer(() => blob);
    restore = stub.restore;

    const result = await downloadJobAttachment('/api/v1/files/5/download');

    expect(stub.requests).toEqual([
      { url: '/api/v1/files/5/download', method: 'get', responseType: 'blob' },
    ]);
    expect(result).toBe(blob);
  });

  it('접근 권한이 없으면(403 FILE_ACCESS_DENIED) 오류를 그대로 올려보낸다', async () => {
    const stub = stubServer(
      () =>
        new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, null, {
          status: 403,
          data: new Blob(
            [
              JSON.stringify({
                success: false,
                error: { code: 'FILE_ACCESS_DENIED', message: '이 파일에 접근할 권한이 없습니다.' },
              }),
            ],
            { type: 'application/json' },
          ),
          statusText: '',
          headers: {},
          config: { headers: new AxiosHeaders() },
        }),
    );
    restore = stub.restore;

    await expect(downloadJobAttachment('/api/v1/files/5/download')).rejects.toMatchObject({
      status: 403,
      code: 'FILE_ACCESS_DENIED',
    });
  });
});

describe('fetchAdminJobDetail', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('관리자 상세 경로(GET /api/v1/admin/jobs/{jobId})로 요청하고 data.data를 반환한다', async () => {
    const detail = { jobId: 7, title: '임시저장 공고', status: 'DRAFT' };
    const stub = stubServer(() => ({ success: true, data: detail }));
    restore = stub.restore;

    const result = await fetchAdminJobDetail(7);

    expect(stub.requests).toEqual([
      { url: '/api/v1/admin/jobs/7', method: 'get', responseType: undefined },
    ]);
    expect(result).toEqual(detail);
  });
});
