import { api, type ApiResponse } from '@/shared/api';

import type { Session } from '../model/session';

export async function fetchSession(): Promise<Session> {
  const { data } = await api.get<ApiResponse<Session>>('/api/v1/auth/session');
  return data.data;
}
