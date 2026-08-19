import { api, type ApiResponse } from '@/shared/api';

import type { MyProfile } from '../model/myProfile';

/** `GET /me/profile` — 현재 로그인한 사용자의 프로필 조회. */
export async function fetchMyProfile(): Promise<MyProfile> {
  const { data } = await api.get<ApiResponse<MyProfile>>('/api/v1/me/profile');
  return data.data;
}
