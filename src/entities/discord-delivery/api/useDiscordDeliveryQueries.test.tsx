import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { AxiosAdapter, AxiosResponse } from 'axios';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/shared/api';

import {
  discordDeliveryKeys,
  useDiscordDeliveryListQuery,
  useRetryDiscordDeliveryMutation,
} from './useDiscordDeliveryQueries';
import type { DiscordDeliveryListResponse } from '../model/types';

/** `discordDeliveryApi.test.ts`와 같은 방식으로 실제 요청을 캡처한다 — Query Hook이 그 위에서
 * params를 그대로 전달하는지, 성공 시 실제로 무효화하는지까지 함께 고정한다. */
function stubServer(handler: (config: Parameters<AxiosAdapter>[0]) => unknown) {
  const requests: { url: string; method?: string; params?: unknown }[] = [];
  const originalAdapter = api.defaults.adapter;

  api.defaults.adapter = async (config) => {
    requests.push({ url: config.url ?? '', method: config.method, params: config.params });
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

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
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

describe('useDiscordDeliveryListQuery', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('전달한 page/size/status로 목록을 조회한다', async () => {
    const stub = stubServer(() => ({ success: true, data: LIST_RESPONSE }));
    restore = stub.restore;
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(
      () => useDiscordDeliveryListQuery({ page: 1, size: 10, status: 'FAILED' }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(stub.requests).toEqual([
      {
        url: '/api/v1/admin/discord-deliveries',
        method: 'get',
        params: { page: 1, size: 10, status: 'FAILED' },
      },
    ]);
    expect(result.current.data).toEqual(LIST_RESPONSE);
  });
});

describe('useRetryDiscordDeliveryMutation', () => {
  let restore: () => void;

  afterEach(() => restore());

  it('JOB 재시도 성공 시 discordDeliveryKeys.all을 무효화한다', async () => {
    const stub = stubServer(() => ({ success: true, data: null }));
    restore = stub.restore;
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRetryDiscordDeliveryMutation(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ targetType: 'JOB', targetId: 10 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(stub.requests).toEqual([
      { url: '/api/v1/admin/jobs/10/discord/retry', method: 'post', params: undefined },
    ]);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: discordDeliveryKeys.all });
  });
});
