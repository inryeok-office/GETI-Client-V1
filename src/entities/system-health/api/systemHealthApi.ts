import { api, type ApiResponse } from '@/shared/api';

import type { SystemHealth } from '../model/types';

const SYSTEM_HEALTH_PATH = '/api/v1/admin/system/health';

/**
 * `GET /api/v1/admin/system/health` — 핵심 인프라 5종(APPLICATION/DATABASE/REDIS/
 * ELASTICSEARCH/FILE_STORAGE)의 현재 UP/DOWN 상태(GETI-Server-V1 PR #327). DEVELOPER 전용이라
 * 개발자 대시보드에서만 호출한다.
 */
export async function fetchSystemHealth(): Promise<SystemHealth> {
  const { data } = await api.get<ApiResponse<SystemHealth>>(SYSTEM_HEALTH_PATH);
  return data.data;
}
