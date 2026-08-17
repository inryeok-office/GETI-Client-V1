import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';

import { ApiError, api, getAccessToken, setAccessToken, toApiError, REFRESH_PATH } from './index';

function axiosErrorWith(status: number, data?: unknown) {
  return new AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    { headers: new AxiosHeaders() },
    null,
    { status, data, statusText: '', headers: {}, config: { headers: new AxiosHeaders() } },
  );
}

describe('axios 인스턴스', () => {
  it('공통 설정을 인스턴스 하나에 모아둔다', () => {
    expect(api.defaults.timeout).toBe(10_000);
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});

describe('인증 인터셉터', () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    setAccessToken(null);
  });

  function stubServer(handler: (url: string, config: Parameters<AxiosAdapter>[0]) => unknown) {
    const requests: { url: string; authorization?: string }[] = [];

    api.defaults.adapter = async (config) => {
      const url = config.url ?? '';
      requests.push({ url, authorization: config.headers.get?.('Authorization') as string });

      const result = handler(url, config);

      if (result instanceof AxiosError) {
        throw Object.assign(result, { config });
      }

      return { data: result, status: 200, statusText: 'OK', headers: {}, config } as AxiosResponse;
    };

    return requests;
  }

  function unauthorized() {
    return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, null, {
      status: 401,
      data: { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } },
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
  }

  it('저장된 Access Token을 Authorization 헤더로 붙인다', async () => {
    setAccessToken('token-1');
    const requests = stubServer(() => ({ success: true, data: null }));

    await api.get('/api/v1/auth/session');

    expect(requests[0].authorization).toBe('Bearer token-1');
  });

  it('401이면 재발급 후 원래 요청을 다시 보낸다', async () => {
    setAccessToken('expired');
    let isFirstCall = true;
    const requests = stubServer((url) => {
      if (url === REFRESH_PATH) {
        return {
          success: true,
          data: { accessToken: 'fresh', refreshToken: 'r', accessTokenExpiresInSeconds: 900 },
        };
      }
      if (isFirstCall) {
        isFirstCall = false;
        return unauthorized();
      }
      return { success: true, data: { memberId: 1 } };
    });

    const response = await api.get('/api/v1/auth/session');

    expect(response.data.data).toEqual({ memberId: 1 });
    expect(requests.map((request) => request.url)).toEqual([
      '/api/v1/auth/session',
      REFRESH_PATH,
      '/api/v1/auth/session',
    ]);
    expect(requests[2].authorization).toBe('Bearer fresh');
    expect(getAccessToken()).toBe('fresh');
  });

  it('401이 동시에 여러 개 터져도 재발급은 한 번만 보낸다', async () => {
    setAccessToken('expired');
    const expired = new Set(['/a', '/b', '/c']);
    const requests = stubServer((url) => {
      if (url === REFRESH_PATH) {
        return {
          success: true,
          data: { accessToken: 'fresh', refreshToken: 'r', accessTokenExpiresInSeconds: 900 },
        };
      }
      if (expired.delete(url)) return unauthorized();
      return { success: true, data: url };
    });

    await Promise.all([api.get('/a'), api.get('/b'), api.get('/c')]);

    expect(requests.filter((request) => request.url === REFRESH_PATH)).toHaveLength(1);
  });

  it('재발급까지 실패하면 토큰을 비우고 401을 올려보낸다', async () => {
    setAccessToken('expired');
    stubServer(() => unauthorized());

    await expect(api.get('/api/v1/auth/session')).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
    });
    expect(getAccessToken()).toBeNull();
  });
});

describe('toApiError', () => {
  it('서버가 보낸 message와 code를 꺼내 쓴다', () => {
    const result = toApiError(
      axiosErrorWith(404, {
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: '요청한 리소스를 찾을 수 없습니다.',
          status: 404,
          fieldErrors: [],
        },
      }),
    );

    expect(result).toBeInstanceOf(ApiError);
    expect(result.status).toBe(404);
    expect(result.code).toBe('RESOURCE_NOT_FOUND');
    expect(result.message).toBe('요청한 리소스를 찾을 수 없습니다.');
  });

  it('검증 실패의 fieldErrors를 그대로 전달한다', () => {
    const fieldErrors = [{ field: 'title', message: '제목은 필수입니다' }];
    const result = toApiError(
      axiosErrorWith(400, { success: false, error: { code: 'VALIDATION_FAILED', fieldErrors } }),
    );

    expect(result.fieldErrors).toEqual(fieldErrors);
  });

  it('응답 본문에 message가 없으면 axios 메시지로 대체한다', () => {
    expect(toApiError(axiosErrorWith(500)).message).toBe('Request failed');
  });

  it('네트워크 단계에서 실패하면 status가 없다', () => {
    const result = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'));

    expect(result.status).toBeUndefined();
    expect(result.message).toBe('Network Error');
  });

  it('axios가 아닌 오류도 ApiError로 정규화한다', () => {
    expect(toApiError(new Error('boom')).message).toBe('boom');
    expect(toApiError('문자열').message).toBe('알 수 없는 오류가 발생했습니다');
  });

  it('이미 ApiError면 그대로 돌려준다', () => {
    const original = new ApiError('그대로', 418, 'TEAPOT');

    expect(toApiError(original)).toBe(original);
  });
});
