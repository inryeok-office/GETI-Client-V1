import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { ApiError, api, toApiError } from './index';

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

describe('toApiError', () => {
  it('서버가 보낸 message와 code를 꺼내 쓴다', () => {
    const result = toApiError(
      axiosErrorWith(404, { message: '공고를 찾을 수 없습니다', code: 'JOB_NOT_FOUND' }),
    );

    expect(result).toBeInstanceOf(ApiError);
    expect(result.status).toBe(404);
    expect(result.code).toBe('JOB_NOT_FOUND');
    expect(result.message).toBe('공고를 찾을 수 없습니다');
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
