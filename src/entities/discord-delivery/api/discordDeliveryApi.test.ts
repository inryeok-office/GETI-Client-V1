import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';

import { api } from '@/shared/api';

import { fetchDiscordDeliveryList, retryDiscordDelivery } from './discordDeliveryApi';
import type { DiscordDeliveryListResponse } from '../model/types';

/**
 * `axiosInstance.test.ts`와 같은 방식으로 실제 `api` 인스턴스의 adapter를 갈아 끼운다 —
 * `@/shared/api`를 통째로 mock하면 params 조립·URL 분기 같은 실제 호출 계약이 틀려도
 * 테스트가 통과한다(PR #142 코드리뷰 반영).
 */
function stubServer(handler: (config: Parameters<AxiosAdapter>[0]) => unknown) {
  const requests: { url: string; method?: string; params?: unknown }[] = [];
  const originalAdapter = api.defaults.adapter;

  api.defaults.adapter = async (config) => {
    requests.push({ url: config.url ?? '', method: config.method, params: config.params });
    const result = handler(config);

    if (result instanceof AxiosError) throw Object.assign(result, { config });

    return { data: result, status: 200, statusText: 'OK', headers: {}, config } as AxiosResponse;
  };

  return { requests, restore: () => (api.defaults.adapter = originalAdapter) };
}

const LIST_RESPONSE: DiscordDeliveryListResponse = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

describe('fetchDiscordDeliveryList', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('기본값(page=0, size=20)으로 GET /admin/discord-deliveries를 호출한다', async () => {
    const stub = stubServer(() => ({ success: true, data: LIST_RESPONSE }));
    restore = stub.restore;

    await fetchDiscordDeliveryList();

    expect(stub.requests).toEqual([
      { url: '/api/v1/admin/discord-deliveries', method: 'get', params: { page: 0, size: 20 } },
    ]);
  });

  it('전달한 page/size/status로 덮어써 호출한다', async () => {
    const stub = stubServer(() => ({ success: true, data: LIST_RESPONSE }));
    restore = stub.restore;

    await fetchDiscordDeliveryList({ page: 2, size: 50, status: 'FAILED' });

    expect(stub.requests).toEqual([
      {
        url: '/api/v1/admin/discord-deliveries',
        method: 'get',
        params: { page: 2, size: 50, status: 'FAILED' },
      },
    ]);
  });

  it('응답의 data.data를 그대로 돌려준다', async () => {
    const stub = stubServer(() => ({ success: true, data: LIST_RESPONSE }));
    restore = stub.restore;

    await expect(fetchDiscordDeliveryList()).resolves.toEqual(LIST_RESPONSE);
  });
});

describe('retryDiscordDelivery', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('JOB은 /admin/jobs/{jobId}/discord/retry로 POST한다', async () => {
    const stub = stubServer(() => ({ success: true, data: null }));
    restore = stub.restore;

    await retryDiscordDelivery({ targetType: 'JOB', targetId: 10 });

    expect(stub.requests).toEqual([
      { url: '/api/v1/admin/jobs/10/discord/retry', method: 'post', params: undefined },
    ]);
  });

  it('PROGRAM은 /admin/programs/{programId}/discord/retry로 POST한다', async () => {
    const stub = stubServer(() => ({ success: true, data: null }));
    restore = stub.restore;

    await retryDiscordDelivery({ targetType: 'PROGRAM', targetId: 40 });

    expect(stub.requests).toEqual([
      { url: '/api/v1/admin/programs/40/discord/retry', method: 'post', params: undefined },
    ]);
  });

  it('409(재시도 불가) 응답을 그대로 올려보낸다', async () => {
    const stub = stubServer(
      () =>
        new AxiosError('Request failed', 'ERR_BAD_REQUEST', { headers: new AxiosHeaders() }, null, {
          status: 409,
          data: {
            success: false,
            error: { code: 'DISCORD_DELIVERY_NOT_RETRYABLE', message: '재시도할 수 없습니다.' },
          },
          statusText: '',
          headers: {},
          config: { headers: new AxiosHeaders() },
        }),
    );
    restore = stub.restore;

    await expect(retryDiscordDelivery({ targetType: 'JOB', targetId: 10 })).rejects.toMatchObject({
      status: 409,
      code: 'DISCORD_DELIVERY_NOT_RETRYABLE',
    });
  });
});
