import axios, { AxiosError } from 'axios';

/**
 * 프로젝트의 유일한 axios 인스턴스.
 * baseURL, 헤더, 인터셉터, 공통 에러 처리를 여기에 모은다.
 * 컴포넌트에서 이 인스턴스를 직접 쓰지 않고 도메인 api 훅을 거친다.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

/** 서버가 돌려주는 에러 응답 형태. 백엔드와 확정되면 이 타입을 맞춘다. */
export interface ApiErrorBody {
  message?: string;
  code?: string;
}

/** 화면에서 사용할 정규화된 에러. status가 없으면 네트워크 단계에서 실패한 것이다. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    return new ApiError(
      axiosError.response?.data?.message ?? axiosError.message,
      axiosError.response?.status,
      axiosError.response?.data?.code,
    );
  }

  return new ApiError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
}

// 모든 실패를 ApiError로 정규화한다. 인증 토큰 주입은 인증 방식이 확정된 뒤 추가한다.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
