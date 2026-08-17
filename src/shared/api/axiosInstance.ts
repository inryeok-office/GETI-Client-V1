import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { getAccessToken, setAccessToken } from './tokenStore';

export const REFRESH_PATH = '/api/v1/auth/token/refresh';

const baseURL = typeof window === 'undefined' ? process.env.NEXT_PUBLIC_API_BASE_URL : '';

export const api = axios.create({
  baseURL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { requestId?: string | null };
}

export interface FieldError {
  field?: string;
  message?: string;
}

export interface ApiErrorBody {
  success?: boolean;
  error?: {
    code?: string;
    message?: string;
    status?: number;
    path?: string;
    timestamp?: string;
    fieldErrors?: FieldError[];
  };
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
    readonly fieldErrors: FieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const body = axiosError.response?.data?.error;
    return new ApiError(
      body?.message ?? axiosError.message,
      axiosError.response?.status ?? body?.status,
      body?.code,
      body?.fieldErrors ?? [],
    );
  }

  return new ApiError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
}

type RetriableConfig = InternalAxiosRequestConfig & { isRetried?: boolean };

let refreshing: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  refreshing ??= api
    .post<ApiResponse<TokenRefreshResponse>>(REFRESH_PATH)
    .then((response) => {
      const { accessToken } = response.data.data;
      setAccessToken(accessToken);
      return accessToken;
    })
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
}

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken && config.url !== REFRESH_PATH) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const config: RetriableConfig | undefined = axios.isAxiosError(error)
      ? error.config
      : undefined;
    const isExpiredToken =
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      config !== undefined &&
      !config.isRetried &&
      config.url !== REFRESH_PATH;

    if (isExpiredToken) {
      config.isRetried = true;

      try {
        await refreshAccessToken();
        return await api(config);
      } catch {
        setAccessToken(null);
      }
    }

    return Promise.reject(toApiError(error));
  },
);
